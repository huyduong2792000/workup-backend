from application.extensions import apimanager
from application.models.model import *
from gatco.exceptions import ServerError
from application.components import auth_func
from application.extensions import auth
from gatco.response import text, json
from application.components.user.model import User, Role
from application.components.group.model import Group,GroupsUsers
from application.components.task_info.model import TaskInfo
import random
import string
from application.server import app
from datetime import datetime
from sqlalchemy import and_, or_,func,literal,update
import re
import json as ujson
from gatco_restapi.helpers import to_dict

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

def generate_string(num=7):
    code = ''.join(random.choice(string.ascii_uppercase + string.digits)
                   for _ in range(num))

    while code[:1] == '0':
        code = ''.join(random.choice(string.ascii_uppercase +
                                     string.digits) for _ in range(num))

    return "%s" % (code)



@app.route('/api/v1/group', methods=["POST"])
def createGroup(request=None, data=None, Model=None):
    uid = auth.current_user(request)
    if uid is not None:
        group = request.json
        response = group
        group['unsigned_name'] = no_accent_vietnamese(group['group_name'])
        group['created_by'] = uid
        # members = group['members']
        new_group = Group()
        for key in group.keys():
            if hasattr(new_group,key) and not isinstance(group[key], (dict, list )):
                setattr(new_group, key, group[key])
        db.session.add(new_group)
        db.session.flush()
        # #update group last access user to new group
        # user_update = db.session.query(User).filter(User.id == uid).first()
        # user_update.group_last_access_id = new_group.id
        # user_update.group = new_group
        # db.session.add(user_update)
        #set current user become admin default
        role_admin_id = db.session.query(Role.id).filter(Role.role_name == 'admin').first()
        new_group_user = GroupsUsers(
            user_id = uid,
            group_id = new_group.id,
            role_id = role_admin_id
        )
        db.session.add(new_group_user)
        # db.session.commit()
        all_roles = db.session.query(Role).all()
        db.session.commit()
        response['id'] = str(new_group.id)
        return json(response,status=201)

    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)
def getRole(all_roles,role_find):
    for role in all_roles:
        if role.role_name == role_find:
            return role
    return None
@app.route('/api/v1/group/<group_id>', methods=["PUT"])
def putGroup(request=None, group_id=None):
    uid = auth.current_user(request)
    if uid is not None:
        group = request.json
        response = group
        group['unsigned_name'] = no_accent_vietnamese(group.get('group_name'))
        deleted = group.get('deleted',False)
        if not deleted:
            members = group.get('members',[])
            group_update = db.session.query(Group).filter(Group.id == group['id']).first()
            for key in group.keys():
                if hasattr(group_update,key) and key not in ["assignee","members","check_lists","tasks_info"]:
                    setattr(group_update, key, group[key])
            if group.get("assignee",None) != None and group.get("assignee_id",None) == None:
                setattr(group_update, "assignee_id", group["assignee"]['id'])
            db.session.add(group_update)
            db.session.commit()
            return json(to_dict(group_update),status=200)
        else:
            #DELETE GROUP AND TASK INFO IN GROUP
            group_update = db.session.query(Group).filter(Group.id == group['id']).first()
            group_update.deleted = True
            db.session.query(TaskInfo).filter(TaskInfo.group_id == group_update.id)\
            .update({TaskInfo.deleted:True}, synchronize_session = False)
            db.session.add(group_update)
            db.session.commit()
            return json(to_dict(group_update),status=200)
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)

def format_list_group(list_groups,uid):
    result = []
    id_role_admin = db.session.query(Role.id).filter(Role.role_name == 'admin').first()
    for group in list_groups:
        group_append = {}
        group_append = {'id':str(group[0]),'group_name':group[1],'description':group[2]} 
        role_member = db.session.query(Role).filter(Role.role_name == "member").first()
        total_members = db.session.query(func.count(GroupsUsers.user_id)).filter(GroupsUsers.group_id==group[0],GroupsUsers.role_id == role_member.id).scalar()
        group_append['total_members'] = total_members

        check_current_user_is_member = db.session.query(func.count(GroupsUsers.user_id))\
        .filter(GroupsUsers.group_id == group[0],GroupsUsers.user_id == uid,GroupsUsers.role_id != id_role_admin).scalar()
        group_append['check_current_user_is_member'] = check_current_user_is_member

        first_five_members = db.session.query(User.id,User.phone,User.email,User.display_name).join(GroupsUsers)\
        .filter(GroupsUsers.group_id == group[0],GroupsUsers.role_id != id_role_admin).order_by(GroupsUsers.created_at.desc()).limit(5).all()
        group_append['first_five_members'] = [{'id':str(member[0]),'phone':member[1],'email':member[2],'display_name':member[3]} for member in first_five_members]
        

        total_admins = db.session.query(func.count(GroupsUsers.user_id)).filter(GroupsUsers.group_id==group[0],GroupsUsers.role_id == id_role_admin).scalar()
        group_append['total_admins'] = total_admins

        check_current_user_is_admin = db.session.query(func.count(GroupsUsers.user_id))\
        .filter(GroupsUsers.group_id == group[0],GroupsUsers.user_id == uid,GroupsUsers.role_id == id_role_admin).scalar()
        group_append['check_current_user_is_admin'] = check_current_user_is_admin

        first_five_admins = db.session.query(User.id,User.phone,User.email,User.display_name).join(GroupsUsers)\
        .filter(GroupsUsers.group_id == group[0],GroupsUsers.role_id == id_role_admin).order_by(GroupsUsers.created_at.desc()).limit(5).all()
        group_append['first_five_admins'] = [{'id':str(member[0]),'phone':member[1],'email':member[2],'display_name':member[3]} for member in first_five_admins]

        result.append(group_append)
    return result

@app.route('/api/v1/group', methods=["GET"])
def getGroup(request=None):
    uid = auth.current_user(request)
    if uid is not None:
        page = request.args.get("page", None) or 1
        results_per_page = request.args.get("results_per_page", None) or 50
        offset=(int(page)-1)*int(results_per_page)
        list_groups = db.session.query(Group.id,Group.group_name,Group.description)\
        .join(GroupsUsers)\
        .filter(GroupsUsers.user_id == uid,Group.deleted == False)\
        .order_by(GroupsUsers.created_at.desc()).limit(results_per_page).offset(offset).all()

        result = format_list_group(list_groups,uid)

        return json({"num_results":len(result),"objects":result,"page":page})

    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)

@app.route('/api/v1/filter_group_by_group_name', methods=["GET"])
def getGroup(request=None):
    uid = auth.current_user(request)
    if uid is not None:
        page = request.args.get("page", None) or 1
        results_per_page = request.args.get("results_per_page", 50)
        offset=(int(page)-1)*int(results_per_page)
        filters = ujson.loads(request.args.get("q")).get("filters",{}).get("$or",[])
        search_args = []
        if(len(filters) != 0):
            for filter in filters:
                for key, value in filter.items():
                    search_args.append(
                        getattr(Group, key).ilike('%%%s%%' % value.get("$like"))
                    )
        list_groups = db.session.query(Group.id,Group.group_name,Group.description)\
        .filter(Group.deleted == False, Group.parent_id == None, or_(*search_args))\
        .limit(results_per_page).offset(offset).all()

        result = format_list_group(list_groups,uid)

        return json({"num_results":len(result),"objects":result,"page":page})

    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)

@app.route('/api/v1/group/<group_id>', methods=["GET"])
def getSigleGroup(request=None,group_id=None):
    uid = auth.current_user(request)
    if uid is not None:
        group = db.session.query(Group.id,Group.group_name,Group.description).filter(Group.id == group_id).first()
        result = {}
        result['id'] = str(group[0]) or None
        result['group_name'] = group[1] or None
        result['description'] = group[2] or None
        role_member = db.session.query(Role).filter(Role.role_name == "member").first()
        total_members = db.session.query(func.count(GroupsUsers.user_id)).filter(GroupsUsers.group_id==group[0],GroupsUsers.role_id == role_member.id).scalar()
        result['total_members'] = total_members
        
        total_tasks_info = db.session.query(func.count(TaskInfo.id)).filter(TaskInfo.group_id == result['id']).scalar()
        result['total_tasks_info'] = total_tasks_info

        role_admin = db.session.query(Role).filter(Role.role_name == 'admin').first()
        
        total_admins = db.session.query(func.count(GroupsUsers.user_id)).filter(GroupsUsers.group_id==group[0],GroupsUsers.role_id == role_admin.id).scalar()
        result['total_admins'] = total_admins

        first_five_admins = db.session.query(User.id,User.phone,User.email,User.display_name).join(GroupsUsers)\
        .filter(GroupsUsers.group_id == group[0],GroupsUsers.role_id == role_admin.id).order_by(GroupsUsers.created_at.desc()).limit(5).all()                        
        result['first_five_admins'] = []
        for admin in first_five_admins:
            admin_add = {'id':str(admin[0]),'phone':admin[1],'email':admin[2],'display_name':admin[3]}
            if admin_add['id'] == uid:
                result['first_five_admins'].insert(0,admin_add)
            else:
                result['first_five_admins'].append(admin_add)
        return json(result,status=200)
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)


def getManyGroup(request=None, search_params=None, **kwargs):
    uid = auth.current_user(request)
    if uid is not None:
        if 'filters' in search_params and bool(search_params["filters"]):
            filters = search_params["filters"]
            if "$and" in filters:
                search_params["filters"]['$and'].append({"user_id":{"$eq": uid}})
            else:
                search_params["filters"]={}
                search_params["filters"]['$and'] = [{"user_id":{"$eq": uid}},filters]
        else:
            search_params["filters"] = {'$and':[{"user_id":{"$eq": uid}}]}
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)
def getMyGroup(request=None, search_params=None, **kwargs):
    uid = auth.current_user(request)
    if uid is not None:
        list_group_create_by_me = db.session.query(Group.id).filter(Group.created_by == uid).all()
        list_group_children = db.session.query(Group.id).filter(Group.parent_id.in_(list_group_create_by_me)).all()
        if 'filters' in search_params:
            filters = search_params["filters"]
            if "$or" in filters:
                for group_id in list_group_create_by_me + list_group_children:
                    search_params["filters"]['$or'].append({"id":{"$eq": group_id}})
                print(filters)

            else:
                search_params["filters"]["$or"]=[]
                for group_id in list_group_create_by_me + list_group_children:
                    search_params["filters"]['$or'].append({"id":{"$eq": group_id}})
        else:
            search_params["filters"] = {}
            search_params["filters"]["$or"]=[]
            for group_id in list_group_create_by_me + list_group_children:
                search_params["filters"]['$or'].append({"id":{"$eq": group_id}})
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)

@app.route('/api/v1/get_member/<group_id>', methods=["GET"])
def getMember(request = None, group_id = None):
    uid = auth.current_user(request)
    if uid is not None:
        page = request.args.get("page", None) or 1
        results_per_page = request.args.get("results_per_page", None) or 50
        offset=(int(page)-1)*int(results_per_page)
        members = []
        group = db.session.query(Group).filter(Group.id == group_id).first()
        # print(group.parent_id)
        if group.parent_id is not None:
            members = db.session.query(GroupsUsers).filter(GroupsUsers.group_id == group_id)\
            .order_by(GroupsUsers.updated_at.desc()).limit(results_per_page).offset(offset).all()
        else:
            members = db.session.query(GroupsUsers).filter(GroupsUsers.group_id.in_([group_id,group.parent_id]))\
            .distinct(GroupsUsers.user_id).limit(results_per_page).offset(offset).all()
        # print(members)
        response = []
        # print(members)
        for member in members:

            # member
            print(member.user, member.role_id)
            member_add = to_dict(member.user)
            member_add['role_id'] = str(member.role_id)
            member_add['role_name'] = member.role.role_name
            if str(member_add['id']) == str(uid):
                response.insert(0,member_add)
            else:
                response.append(member_add)
        return json({"num_results":len(response),"objects":response,"page":page})
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)

@app.route('/api/v1/member-action', methods=["POST"])
def getMember(request = None, group_id = None):
    uid = auth.current_user(request)
    if uid is not None:
        data = request.json
        if data['option'] == "upgrade_role_to_admin":
            role_admin = db.session.query(Role).filter(Role.role_name == "admin").first()
            relation_update = db.session.query(GroupsUsers).filter(
                GroupsUsers.group_id == data['group_id'],
                GroupsUsers.user_id == data['member_id']
                ).first()
            relation_update.role_id = role_admin.id
            db.session.add(relation_update)
            db.session.commit()
        elif data['option'] == "downgrade_role_to_member":
            role_member = db.session.query(Role).filter(Role.role_name == "member").first()
            relation_update = db.session.query(GroupsUsers).filter(
                GroupsUsers.group_id == data['group_id'],
                GroupsUsers.user_id == data['member_id']
                ).first()
            relation_update.role_id = role_member.id
            db.session.add(relation_update)
            db.session.commit()
        elif data['option'] == "remove_member":
            relation_update = db.session.query(GroupsUsers).filter(
                GroupsUsers.group_id == data['group_id'],
                GroupsUsers.user_id == data['member_id']
                ).first()
            db.session.delete(relation_update)
            db.session.commit()
        return json({},status=200)
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)


@app.route('/api/v1/add_members', methods=["POST"])
def addMembers(request = None, group_id = None):
    uid = auth.current_user(request)
    if uid is not None:
        data = request.json
        id_role_member = db.session.query(Role.id).filter(Role.role_name == "member").first()
        for member in data['members']:
            if member.get('id',None) is None:
                new_user = createUser(member)
                db.session.add(new_user)
                db.session.flush()
                new_relation = GroupsUsers(
                    user_id = new_user.id,
                    group_id = data['group_id'],
                    role_id = id_role_member
                )
                db.session.add(new_relation)
                db.session.commit()
            else:
                new_relation = GroupsUsers(
                    user_id = member['id'],
                    group_id = data['group_id'],
                    role_id = id_role_member
                )
                db.session.add(new_relation)
                db.session.commit()
        return json({},status=201)
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)
def createUser(member):
    #user_salt = random.choices('e2q8dhaushdauwd7qye', weights = [10, 1, 1], k = 14)
    #user_password = random.choices('e2q8dhaushdauwd7qye', weights = [10, 1, 1], k = 14)
    user_salt = generate_string(16)
    user_password = generate_string(32)

    new_user = User(
        is_active = False,
        phone = member['phone'],
        display_name = member['display_name'],
        unsigned_display_name = no_accent_vietnamese(member['display_name']),
        password = user_password, 
        salt = user_salt)
    return new_user


@app.route('/api/v1/add_member', methods=["POST"])
async def addMembers(request = None, group_id = None):
    uid = auth.current_user(request)
    if uid is not None:
        data = request.json
        phone = data.get("phone")
        group_id = data.get("group_id")
        user_id = db.session.query(User.id).filter(User.phone == phone, User.is_active == True).first()
        if user_id is not None:
            id_role_member = db.session.query(Role.id).filter(Role.role_name == "member").first()
            check_is_member = db.session.query(GroupsUsers.id).filter(GroupsUsers.user_id == user_id, GroupsUsers.group_id == group_id).first()
            if check_is_member is None:
                new_relation = GroupsUsers(
                    user_id = user_id,
                    group_id = group_id,
                    role_id = id_role_member
                )
                db.session.add(new_relation)
                db.session.commit()
                return json({},status=201)
        else:
            return json({
            "error_message":"Không tìm được số điện thoại này"
        }, status = 520)

    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)

@app.route('/api/v1/join_to_group', methods=["POST"])
def join_to_group(request = None):
    uid = auth.current_user(request)
    if uid is not None:
        data = request.json
        group_id = data.get('group_id')
        user_id = data.get('user_id')
        check_is_member = db.session.query(GroupsUsers.id).filter(GroupsUsers.group_id == group_id, GroupsUsers.user_id == user_id).first()
        if check_is_member is None:
            id_role_member = db.session.query(Role.id).filter(Role.role_name == 'member').first()
            new_relation = GroupsUsers(
                user_id = user_id,
                group_id = group_id,
                role_id = id_role_member
            )
            db.session.add(new_relation)
            db.session.commit()
        return json({"ok":True})

    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)
@app.route('/api/v1/leave_to_group', methods=["POST"])
def join_to_group(request = None):
    uid = auth.current_user(request)
    if uid is not None:
        data = request.json
        group_id = data.get('group_id')
        user_id = data.get('user_id')
        relation = db.session.query(GroupsUsers).filter(GroupsUsers.group_id == group_id, GroupsUsers.user_id == user_id).first()
        if relation is not None:
            db.session.delete(relation)
            db.session.commit()
        return json({"ok":True})

    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)
apimanager.create_api(collection_name='filter_group', model=Group,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func], POST=[auth_func,], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
    postprocess=dict(POST=[auth_func], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[]),
    exclude_columns = ['members','checklists','tasks_info']
    )

apimanager.create_api(collection_name='groups_users', model=GroupsUsers,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func,getManyGroup], POST=[auth_func,], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
    postprocess=dict(POST=[auth_func], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[]),
    )
