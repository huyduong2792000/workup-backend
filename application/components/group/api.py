from application.extensions import apimanager
from application.models.model import *
from gatco.exceptions import ServerError
from application.components import auth_func
from application.extensions import auth
from gatco.response import text, json
from application.components.user.model import User, Role
from application.components.group.model import Group,GroupsUsers
from application.components.task_info.model import TaskInfo

from application.server import app
from datetime import datetime
from sqlalchemy import and_, or_,func,literal
import re
import json as to_json
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


@app.route('/api/v1/group', methods=["POST"])
def createGroup(request=None, data=None, Model=None):
    uid = auth.current_user(request)
    if uid is not None:
        group = request.json
        response = group
        group['unsigned_name'] = no_accent_vietnamese(group['group_name'])
        group['created_by'] = uid
        members = group['members']
        new_group = Group()
        for key in group.keys():
            if hasattr(new_group,key) and not isinstance(group[key], (dict, list )):
                setattr(new_group, key, group[key])
        db.session.add(new_group)
        db.session.flush()
        #set current user become admin default
        role_admin_id = db.session.query(Role.id).filter(Role.role_name == 'admin').first()
        new_group_user = GroupsUsers(
            user_id = uid,
            group_id = new_group.id,
            role_id = role_admin_id
        )
        db.session.add(new_group_user)
        db.session.commit()
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
        group['unsigned_name'] = no_accent_vietnamese(group['group_name'])
        members = group['members']
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
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)

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
        # list_groups = db.session.query(Group.id,Group.group_name,Group.description).filter(Group.members.any(User.id == uid),Group.deleted == False).order_by(Group.created_at.desc()).limit(results_per_page).offset(offset).all()
        # print(list_groups)
        result = []
        id_role_admin = db.session.query(Role.id).filter(Role.role_name == 'admin')
        for group in list_groups:
            group_append = {}
            group_append = {'id':str(group[0]),'group_name':group[1],'description':group[2]} 
            total_members = db.session.query(func.count(GroupsUsers.user_id)).filter(GroupsUsers.group_id==group[0]).scalar()
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
        total_members = db.session.query(func.count(GroupsUsers.user_id)).filter(GroupsUsers.group_id==group[0]).scalar()
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


apimanager.create_api(collection_name='filter_group', model=Group,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func], POST=[auth_func,], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
    postprocess=dict(POST=[auth_func], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[]),
    )



apimanager.create_api(collection_name='groups_users', model=GroupsUsers,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func,getManyGroup], POST=[auth_func,], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
    postprocess=dict(POST=[auth_func], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[]),
    )
