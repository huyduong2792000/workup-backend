from gatco.response import json, text
from application.server import app
from application.database import db, redisdb
from application.extensions import auth
import random
import string
from application.extensions import apimanager
from application.models.model import User, Role,Employee
from application.controllers import auth_func
from sqlalchemy import and_, or_
from gatco_restapi.helpers import to_dict


@app.route("/login", methods=["POST", "GET"])
async def user_login(request):
    param = request.json
    user_name = param.get("username")
    password = param.get("password")
    print(user_name, password)
    if (user_name is not None) and (password is not None):
        user = db.session.query(User).filter(User.user_name == user_name).first()
        if (user is not None) and auth.verify_password(password, user.password, user.salt):
            try:
                user.employee.status = 'online'
                db.session.commit()
            except:
                pass
            auth.login_user(request, user)
            result = to_dict(user)
            
            # print('result==========',result)
            return json(result)
        return json({"error_code":"LOGIN_FAILED","error_message":"user does not exist or incorrect password"}, status=520)
    else:
        return json({"error_code": "PARAM_ERROR", "error_message": "param error"}, status=520)
    return text("user_login api")

@app.route("/logout", methods=["GET"])
async def user_logout(request):
    uid = auth.current_user(request)
    # user = db.session.query(User).filter(User.id == int(current_user)).first()
    try:
        user_info = db.session.query(User).filter(User.id == uid).first()
        user_info.employee.status='offline'
        db.session.commit()
    except:
        pass
    auth.logout_user(request)
    return json({})

    


@app.route('/current-user', methods=["GET", "OPTIONS"])
async def get_current_user(request):
    error_msg = None
    uid = auth.current_user(request)
    if uid is not None:
        user_info = db.session.query(User).filter(User.id == uid).first()
        user_info = to_dict(user_info)
        return json(user_info)
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)
    
    # print("===============", user_info)
    # if user_info is not None:
        
        
   
# def get_current_user(request):
#     #user = auth.current_user(request)
#     # return json({"id": user.id, "user_name": user.user_name, "full_name": user.full_name,"employee_id":user.employee_id,"role":user.roles[0].role_name})
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


def valid_employe(request=None, data=None, **kw):
    id_identifier =  data.get('id_identifier')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')
    position =  data.get('position')
    if data.get('id') is None:
        if email != None and id_identifier != None and position != None:
            check_employee = Employee.query.filter(or_(Employee.email == email, Employee.id_identifier == id_identifier)).first()
            if check_employee is None:
                pass
#                 request.args['password'] = data['password']
#                 request.args['confirm_password'] = data['confirm_password']
#                 del data['confirm_password']
#                 del data['password']
                
            else:
                return json({"error_code": "INSERT_ERROR", "error_message": "Nhân viên đã tồn tại, vui lòng kiểm tra lại!"}, status=520)   
        else:
            return json({"error_code": "PARAM_INVALID", "error_message": "Dữ liệu không đúng định dạng!"}, status=520)
    else:
        del data['email']
        if position is not None:
            pass
        else:
            return json({"error_code": "PARAM_INVALID", "error_message": "Dữ liệu không đúng định dạng!"}, status=520)
        
def user_register(request=None, Model=None, result=None, **kw):
    param = request.json
#     password = request.args['password']
    password = "123456"
#     confirm_password= request.args['confirm_password']
    
    role_admin = Role.query.filter(Role.role_name == "admin").first()
    role_user = Role.query.filter(Role.role_name == "user").first()
    role_employee = Role.query.filter(Role.role_name == "employee").first()
    role_leader = Role.query.filter(Role.role_name == "leader").first()
    # print("model==========",result)

    letters = string.ascii_lowercase
    user_salt = ''.join(random.choice(letters) for i in range(64))
    user_password=auth.encrypt_password(password, user_salt)
    user = User(email=param['email'], password=user_password, salt=user_salt, user_name= param['email'],  phone_number= param['phone_number'],  full_name=param['full_name'])
    if (param['position']=='employee' or param['position'] is None):
        user.roles = [role_employee]
    if (param['position']=='leader'):
        user.roles = [role_leader]
        
    employee = db.session.query(Employee).filter(Employee.id == result['id']).first()
    employee.user = [user]
#     print('role',role_employee)
    db.session.add(employee)

    db.session.commit()
   
def update_user(request=None, Model=None, result=None, **kw):
    param = request.json
   
    role_admin = Role.query.filter(Role.role_name == "admin").first()
    role_user = Role.query.filter(Role.role_name == "user").first()
    role_employee = Role.query.filter(Role.role_name == "employee").first()
    role_leader = Role.query.filter(Role.role_name == "leader").first()
    user = db.session.query(User).filter(User.email == result['email']).first()
    user.phone_number = param['phone_number']
    user.full_name = param['full_name']
    
    if (param['position']=='employee' or param['position'] is None):
        user.roles = [role_employee]
    if (param['position']=='leader'):
        user.roles = [role_leader]
    
    employee = db.session.query(Employee).filter(Employee.id == result['id']).first()
    employee.user = [user]
#     print('role',role_employee)
    db.session.add(employee)

    db.session.commit()
    
apimanager.create_api(collection_name='user', model=User,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func], POST=[auth_func], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
    postprocess=dict(POST=[], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[])
    )

 
apimanager.create_api(collection_name='role', model=Role,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func], POST=[auth_func], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
    postprocess=dict(POST=[], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[])
    )


apimanager.create_api(collection_name='employee', model=Employee,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func], POST=[auth_func, valid_employe], PUT_SINGLE=[auth_func, valid_employe], DELETE_SINGLE=[auth_func]),
    postprocess=dict(POST=[user_register], PUT_SINGLE=[update_user], DELETE_SINGLE=[], GET_MANY =[])
    )



@app.route('/filter_employee', methods=["GET", "OPTIONS"])
def filter_employee(request):
    search_text = request.args.get("q", None)
    if search_text is not None:
        employees = db.session.query(Employee).filter(or_(Employee.full_name.like('%'+search_text+'%'), Employee.email.like('%'+search_text+'%'))).all()
        data_resp = []
        for employee in employees:
            employee = employee.__dict__
            obj = {"id": str(employee['id']),
                   "full_name": employee['full_name'],
                   "email": employee['email']
                   }
            data_resp.append(obj)
#         print(data_resp)
        return json(data_resp)
    
    else: return json([])
    
    
    