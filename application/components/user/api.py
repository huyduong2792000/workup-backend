from gatco.response import json, text
from application.server import app
from application.database import db, redisdb
from application.extensions import auth
import random
import string
from application.extensions import apimanager
# from application.models.model import  Employee
from application.components.user.model import User, Role
from application.components.group.model import Group,GroupsUsers

from application.components import auth_func
from sqlalchemy import and_, or_
from gatco_restapi.helpers import to_dict
import re

def no_accent_vietnamese(s):
    s = re.sub(r'[àáạảãâầấậẩẫăằắặẳẵ]', 'a', s)
    s = re.sub(r'[ÀÁẠẢÃĂẰẮẶẲẴÂẦẤẬẨẪ]', 'A', s)
    s = re.sub(r'[èéẹẻẽêềếệểễ]', 'e', s)
    s = re.sub(r'[ÈÉẸẺẼÊỀẾỆỂỄ]', 'E', s)
    s = re.sub(r'[òóọỏõôồốộổỗơờớợởỡ]', 'o', s)
    s = re.sub(r'[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]', 'O', s)
    s = re.sub(r'[ìíịỉĩ]', 'i', s)
    s = re.sub(r'[ÌÍỊỈĨ]', 'I', s)
    s = re.sub(r'[ùúụủũưừứựửữ]', 'u', s)
    s = re.sub(r'[ƯỪỨỰỬỮÙÚỤỦŨ]', 'U', s)
    s = re.sub(r'[ỳýỵỷỹ]', 'y', s)
    s = re.sub(r'[ỲÝỴỶỸ]', 'Y', s)
    s = re.sub(r'[Đ]', 'D', s)
    s = re.sub(r'[đ]', 'd', s)
    return s
def response_userinfo(user, **kw):
    if user is not None:
        # employee = to_dict(user.employee)
        group_last_access = user.group_last_access
        
        user_info = to_dict(user)
        if user.group_last_access_id is not None:
            user_info['group_last_access_id'] = str(user.group_last_access.id)
            user_info['group_last_access'] = to_dict(group_last_access)
        else:
            user_info['group_last_access_id'] = None
            user_info['group_last_access'] = None
        # user_info['employee'] = employee
        exclude_attr = ["password", "salt", "created_at", "created_by", "updated_at", "updated_by",
                        "deleted_by", "deleted_at", "deleted", "facebook_access_token", "phone_country_prefix",
                        "phone_national_number", "last_login_at", "current_login_at",
                        "last_login_ip", "current_login_ip", "login_count"]

        for attr in exclude_attr:
            if attr in user_info:
                del(user_info[attr])
        
        
        # permision
        # roles = [{"id": str(role.id), "role_name": role.role_name}
        #          for role in user.roles]

        # roleids = [role.id for role in user.roles]
        # user_info['roles'] = roles
        return user_info
    return None
@app.route("/signup", methods=["POST"])
def user_register(request):
    param = request.json
    phone = param['phone']
    password = param['password']
    display_name = param['display_name']
    unsigned_display_name = no_accent_vietnamese(param['display_name'])
    # print(param)
    check_user_match = db.session.query(User).filter(User.phone == phone).all()
    if len(check_user_match) == 0:
        letters = string.ascii_lowercase
        user_salt = ''.join(random.choice(letters) for i in range(64))
        user_password = auth.encrypt_password(password, user_salt)
        new_user = User(phone = phone,
                        unsigned_display_name = unsigned_display_name,
                        password = user_password, 
                        display_name = display_name, 
                        salt = user_salt)
        db.session.add(new_user)
        db.session.flush()

        new_group = Group(
            group_name="GROUP " + str(display_name),
            unsigned_name="GROUP " + str(unsigned_display_name),
            assignee_id = new_user.id,
            # members=[new_user]
        )
        db.session.add(new_group)
        db.session.flush()
        new_relation = GroupsUsers(
            user_id = new_user.id,
            group_id = new_group.id,
            role_id = db.session.query(Role.id).filter(Role.role_name == "admin").scalar()
        )
        db.session.add(new_relation)
        new_user.group_last_access_id = new_group.id
        new_user.group_last_access = new_group
        db.session.add(new_user)
        db.session.commit()
        return json({"id":str(new_user.id),"phone":phone,"display_name":display_name,"password":password})

@app.route("/api/v1/check_phone_exist", methods=["POST"])
def user_register(request):
    param = request.json
    phone = param.get('phone')
    check = db.session.query(User.query.filter(User.phone == phone).exists()).scalar()
    return json({"check":check},status = 200)

@app.route("/login", methods=["POST"])
async def user_login(request):
    param = request.json
    user_name = param.get("phone")
    password = param.get("password")
    # print(param)
    if (user_name is not None) and (password is not None):
        user = getUser(user_name)
        # print(user)
        if (user is not None) and auth.verify_password(password, user.password, user.salt):
            auth.login_user(request, user)
            result = response_userinfo(user)
            
            # print('result==========',result)
            return json(result,status=201)
        return json({"error_code":"LOGIN_FAILED","error_message":"user does not exist or incorrect password"}, status=520)
    else:
        return json({"error_code": "PARAM_ERROR", "error_message": "param error"}, status=520)
    return text("user_login api")

def getUser(user_name):
    if(checkIsPhoneNumber(user_name) is True):
        user = db.session.query(User).filter(User.phone == user_name).first()            
    else:
        user = db.session.query(User).filter(User.email == user_name).first()
    # print('group_last_access==========',user.group_last_access)

    return user

def checkIsPhoneNumber(phone):
    x = re.search("^(09|08|07|05|03)+[0-9]{8}", phone)
    if(x):
        return True
    else:
        return False

@app.route("/logout", methods=["GET","POST"])
async def user_logout(request):
    uid = auth.current_user(request)
    params = request.json
    # print(params)
    # user = db.session.query(User).filter(User.id == int(current_user)).first()
    user_update = db.session.query(User).filter(User.id == uid).first()
    if user_update is not None:
        user_update.group_last_access_id = params['group_last_access_id']
    db.session.commit()
    auth.logout_user(request)
    return json({})


@app.route('/current-user', methods=["GET", "OPTIONS"])
async def get_current_user(request):
    error_msg = None
    uid = auth.current_user(request)
    if uid is not None:
        user = db.session.query(User).filter(User.id == uid).first()
        user_info = response_userinfo(user)
        return json(user_info)
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message": "USER_NOT_FOUND"
        }, status=520)

    # print("===============", user_info)
    # if user_info is not None:

apimanager.create_api(collection_name='user', model=User,
                      methods=['GET', 'POST', 'DELETE', 'PUT'],
                      url_prefix='/api/v1',
                      preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func], POST=[auth_func], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
                      postprocess=dict(POST=[], PUT_SINGLE=[],DELETE_SINGLE=[], GET_MANY=[])
                      )


apimanager.create_api(collection_name='role', model=Role,
                      methods=['GET', 'POST', 'DELETE', 'PUT'],
                      url_prefix='/api/v1',
                      preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func], POST=[
                                      auth_func], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
                      postprocess=dict(POST=[], PUT_SINGLE=[],
                                       DELETE_SINGLE=[], GET_MANY=[])
                      )

def no_accent_vietnamese(s):
    s = re.sub(r'[àáạảãâầấậẩẫăằắặẳẵ]', 'a', s)
    s = re.sub(r'[ÀÁẠẢÃĂẰẮẶẲẴÂẦẤẬẨẪ]', 'A', s)
    s = re.sub(r'[èéẹẻẽêềếệểễ]', 'e', s)
    s = re.sub(r'[ÈÉẸẺẼÊỀẾỆỂỄ]', 'E', s)
    s = re.sub(r'[òóọỏõôồốộổỗơờớợởỡ]', 'o', s)
    s = re.sub(r'[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]', 'O', s)
    s = re.sub(r'[ìíịỉĩ]', 'i', s)
    s = re.sub(r'[ÌÍỊỈĨ]', 'I', s)
    s = re.sub(r'[ùúụủũưừứựửữ]', 'u', s)
    s = re.sub(r'[ƯỪỨỰỬỮÙÚỤỦŨ]', 'U', s)
    s = re.sub(r'[ỳýỵỷỹ]', 'y', s)
    s = re.sub(r'[ỲÝỴỶỸ]', 'Y', s)
    s = re.sub(r'[Đ]', 'D', s)
    s = re.sub(r'[đ]', 'd', s)
    return s

@app.route('/api/v1/check_user_has_been_account', methods=["GET", "POST"])
def checkContactHasBeenAccount(request=None):
    uid = auth.current_user(request)
    if uid is not None:
        list_contact = request.json
        list_contact_convert = convertListContact(list_contact)
        list_phone = []
        for contact in list_contact_convert:
            list_phone.append(contact['phone'])
        users_match = db.session.query(User).filter(User.phone.in_(list_phone)).all()
        
        response = []
        for contact in list_contact_convert:
            for user in users_match:
                if(user.phone == contact['phone']):
                    contact['display_name_server'] = user.display_name
                    contact['email'] = user.email
                    contact['id'] = str(user.id)
            response.append(contact)
        return json(response)
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)


def convertListContact(list_contact):
    result = []
    for contact in list_contact:
        if contact['contactType'] == "person":
            result.append({
                "display_name": contact['name'],
                "phone":re.sub(r'[^0-9]', '', contact['phoneNumbers'][0]['number'])
            })
    return result


# def get_current_user(request):
#     #user = auth.current_user(request)
#     # return json({"id": user.id, "email": user.email, "full_name": user.full_name,"employee_id":user.employee_id,"role":user.roles[0].role_name})
#     # return json({})
#     # print('request',request.json)
#     token = request.headers.get("Cookie", None)
#     print("token============",token)
#     if token is not None:
#         uid = redisdb.get("sessions:" + token)
#         print("uid=======",uid)
#         scope = request.args.get("scope", None)
#         if uid is not None:
#             uid = uid.decode('utf8')
#             user = db.session.query(User).filter(User.id == uid).first()
#             if user is not None:
#                 if user.is_active == True:
#                     userobj = response_userinfo(user, scope)
#                     return json(userobj)
#                 else:
#                     return json({"error_code": "LOGIN_FAILED", "error_message": "Tài khoản của bạn đã bị khoá. Vui lòng liên hệ quản trị hệ thống để được giải đáp"}, status=520)
#         else:
#             return json({
#                 "error_code": "SESSION_EXPIRED",
#                 "error_message":""
#             }, status = 520)
#     else:
#         return json({
#             "error_code": "SESSION_EXPIRED",
#             "error_message":""
#             }, status = 520)
# def response_userinfo(user, **kw):
#     if user is not None:
#         user_info = to_dict(user)
#         exclude_attr = ["password", "salt", "created_at", "created_by", "updated_at", "updated_by",\
#                          "deleted_by", "deleted_at", "deleted","facebook_access_token","phone_country_prefix",\
#                          "phone_national_number","last_login_at","current_login_at",\
#                          "last_login_ip","current_login_ip","login_count"]

#         for attr in exclude_attr:
#             if attr in user_info:
#                 del(user_info[attr])

#         return user_info
#     return None


# def valid_employe(request=None, data=None, **kw):
#     id_identifier = data.get('id_identifier')
#     email = data.get('email')
#     password = data.get('password')
#     confirm_password = data.get('confirm_password')
#     position = data.get('position')
#     if data.get('id') is None:
#         if email != None and id_identifier != None and position != None:
#             check_employee = Employee.query.filter(
#                 or_(Employee.email == email, Employee.id_identifier == id_identifier)).first()
#             if check_employee is None:
#                 pass
# #                 request.args['password'] = data['password']
# #                 request.args['confirm_password'] = data['confirm_password']
# #                 del data['confirm_password']
# #                 del data['password']

#             else:
#                 return json({"error_code": "INSERT_ERROR", "error_message": "Nhân viên đã tồn tại, vui lòng kiểm tra lại!"}, status=520)
#         else:
#             return json({"error_code": "PARAM_INVALID", "error_message": "Dữ liệu không đúng định dạng!"}, status=520)
#     else:
#         del data['email']
#         if position is not None:
#             pass
#         else:
#             return json({"error_code": "PARAM_INVALID", "error_message": "Dữ liệu không đúng định dạng!"}, status=520)



# def update_user(request=None, Model=None, result=None, **kw):
#     param = request.json
#     role_admin = Role.query.filter(Role.role_name == "admin").first()
#     role_user = Role.query.filter(Role.role_name == "user").first()
#     role_employee = Role.query.filter(Role.role_name == "employee").first()
#     role_leader = Role.query.filter(Role.role_name == "leader").first()
#     user = db.session.query(User).filter(User.email == result['email']).first()
#     user.phone_number = param['phone_number']
#     user.full_name = param['full_name']

#     if (param['position'] == 'employee' or param['position'] is None):
#         user.roles = [role_employee]
#     if (param['position'] == 'leader'):
#         user.roles = [role_leader]

#     employee = db.session.query(Employee).filter(
#         Employee.id == result['id']).first()
#     employee.user = [user]
# #     print('role',role_employee)
#     db.session.add(employee)

#     db.session.commit()
   


# def create_employee(request=None, data=None, **kw):
#     uid = auth.current_user(request)
#     if uid is not None:
#         data['created_by'] = uid
#         data['full_name_unsigned'] = no_accent_vietnamese(data['full_name'])
#     else:
#         return json({
#             "error_code": "USER_NOT_FOUND",
#             "error_message":"USER_NOT_FOUND"
#         }, status = 520)
    
# def filter_employee(request=None, search_params=None, **kwargs):
#     uid = auth.current_user(request)
#     if uid is not None:
#         user = db.session.query(User).filter(User.id == uid).first()
#         employee_id = user.employee_uid
#         if employee_id is not None:
#             if 'filters' in search_params:
#                 filters = search_params["filters"]
#                 if "$and" in filters:
#                     # search_params["filters"]['$and'].append({"active":{"$eq": 1}})
#                     search_params["filters"]['$and'].append({"deleted":{"$eq": False}})
#                     search_params["filters"]['$and'].append({"$or":[{"created_by":{"$eq": uid}},{"id":{"$eq":employee_id}}]})
#                 else:
#                     search_params["filters"]['$and'] = [{"$or":[{"created_by":{"$eq": uid}},{"id":{"$eq":employee_id}}]}, {"deleted":{"$eq": False}}]
#             else:
#                 search_params["filters"] = {'$and':[{"$or":[{"created_by":{"$eq": uid}},{"id":{"$eq":employee_id}}]},{"deleted":{"$eq": False}}]}
#         else:
#             if 'filters' in search_params:
#                 filters = search_params["filters"]
#                 if "$and" in filters:
#                     # search_params["filters"]['$and'].append({"active":{"$eq": 1}})
#                     search_params["filters"]['$and'].append({"deleted":{"$eq": False}})
#                     search_params["filters"]['$and'].append({"$or":[{"created_by":{"$eq": uid}}]})
#                 else:
#                     search_params["filters"]['$and'] = [{"$or":[{"created_by":{"$eq": uid}}]}, {"deleted":{"$eq": False}}]
#             else:
#                 search_params["filters"] = {'$and':[{"$or":[{"created_by":{"$eq": uid}}]},{"deleted":{"$eq": False}}]}

#     else:
#         return json({
#             "error_code": "USER_NOT_FOUND",
#             "error_message":"USER_NOT_FOUND"
#         }, status = 520)   
        
# apimanager.create_api(collection_name='employee', model=Employee,
#                       methods=['GET', 'POST', 'DELETE', 'PUT'],
#                       url_prefix='/api/v1',
#                       preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func,filter_employee], POST=[
#                                       auth_func, valid_employe,create_employee], PUT_SINGLE=[auth_func, valid_employe,create_employee], DELETE_SINGLE=[auth_func]),
#                       postprocess=dict(POST=[user_register], PUT_SINGLE=[
#                           update_user], DELETE_SINGLE=[], GET_MANY=[])
                    #   )

# @app.route('/filter_employee', methods=["GET", "OPTIONS"])
# def filter_employee(request):
#     employees = db.session.query(Employee).all()
#     data_resp = []
#     for employee in employees:
#         employee = employee.__dict__
#         if(employee['deleted'] is False):
#             obj = {"id": str(employee['id']),
#                 "full_name": employee['full_name'],
#                 "email": employee['email']
#                 }
#             data_resp.append(obj)
#     return json(data_resp)
