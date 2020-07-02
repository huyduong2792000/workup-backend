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
    check_user_match = db.session.query(User).filter(User.phone == phone).first()
    letters = string.ascii_lowercase
    user_salt = ''.join(random.choice(letters) for i in range(64))
    user_password = auth.encrypt_password(password, user_salt)
    new_user = None
    if check_user_match is None:
        new_user = User(phone = phone,
                        unsigned_display_name = unsigned_display_name,
                        password = user_password, 
                        display_name = display_name, 
                        salt = user_salt)
    else:
        new_user = check_user_match
        new_user.phone = phone
        new_user.unsigned_display_name = unsigned_display_name
        new_user.password = user_password
        new_user.display_name = display_name
        new_user.salt = user_salt
        new_user.is_active = True

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
    check = db.session.query(User.query.filter(User.phone == phone,User.is_active == True).exists()).scalar()
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

@app.route('/api/v1/check_user_has_been_account', methods=["GET", "POST"])
def checkContactHasBeenAccount(request=None):
    uid = auth.current_user(request)
    if uid is not None:
        data = request.json
        list_contact = data.get('contacts',[])
        group = data.get('group',{})
        # print(group)
        list_contact_convert = convertListContact(list_contact)
        list_phone = []
        for contact in list_contact_convert:
            list_phone.append(contact['phone'])
        users_match = db.session.query(User).filter(User.phone.in_(list_phone)).all()
        # print(users_match)
        response = []
        for contact in list_contact_convert:
            contact['is_member'] = False
            for user in users_match:
                if(user.phone == contact['phone']):
                    contact['display_name_server'] = user.display_name
                    contact['is_member'] = checkUserIsMember(user,group)
                    contact['id'] = str(user.id)
            # print(contact)
            response.append(contact)
        return json(response)
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)

def checkUserIsMember(user,group):
    user_id_match = db.session.query(GroupsUsers.id).filter(
        GroupsUsers.group_id == group.get('id',None),
        GroupsUsers.user_id == user.id
    ).first()
    if user_id_match is None:
        return False
    else:
        return True
    # is_relation_exist = db.session.query(literal(True)).filter(check_follower.exists()).scalar()


def convertListContact(list_contact):
    result = []
    # print(list_contact)
    for contact in list_contact:
        if contact['contactType'] == "person":
            phone = contact.get('phoneNumbers')[0]['number'] if contact.get('phoneNumbers') is not None else ''
            result.append({
                "display_name": contact['name'],
                "phone":re.sub(r'[^0-9]', '', phone)
            })
    return result

@app.route("api/v1/set-group-last-access/<group_id>", methods=["PUT"])
def setGroupLastAccess(request=None,group_id=None):
    uid = auth.current_user(request)
    if uid is not None:
        user_update = db.session.query(User).filter(User.id == uid).first()
        user_update.group_last_access_id = group_id
        db.session.add(user_update)
        db.session.commit()
        return json({},status=200)
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)
