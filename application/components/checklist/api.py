from application.extensions import apimanager
from application.models.model import *
from gatco.exceptions import ServerError
from application.components import auth_func
from application.extensions import auth
from gatco.response import text, json
from application.components.user.model import User, Role
# from application.components.group.model import Group,GroupsUsers
from application.components.checklist.model import CheckList,Shift
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


@app.route('/api/v1/checklist', methods=["POST"])
def createChecklist(request=None, data=None, Model=None):
    uid = auth.current_user(request)
    if uid is not None:
        checklist = request.json
        response = checklist
        checklist['unsigned_name'] = no_accent_vietnamese(checklist['checklist_name'])
        checklist['created_by'] = uid
        
        new_checklist = CheckList()
        for key in checklist.keys():
                if hasattr(new_checklist,key) and key != 'shifts':
                    setattr(new_checklist, key, checklist[key])

        db.session.add(new_checklist)
        db.session.flush()
        # shift = Shift()
        # mapJsonToClass(Shift,checklist['shifts'][0])
        for shift in checklist['shifts']:
            new_shift = Shift()
            for key in shift.keys():
                if hasattr(new_shift,key):
                    setattr(new_shift, key, shift[key])
            new_shift.check_list_id = new_checklist.id
            db.session.add(new_shift)
        # print(new_checklist.__dict__)
        db.session.flush()
        # all_roles = db.session.query(Role).all()
        # db.session.commit()
        # response['id'] = str(new_checklist.id)
        return json(response,status=201)

    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)

# @app.route('/api/v1/group/<group_id>', methods=["PUT"])
# def putGroup(request=None, group_id=None):
#     uid = auth.current_user(request)
#     if uid is not None:
#         group = request.json
#         response = group
#         group['unsigned_name'] = no_accent_vietnamese(group['group_name'])
#         members = group['members']
#         del group['members']
#         group_update = db.session.query(Group).filter(Group.id == group['id']).first()
#         for key in group.keys():
#             if hasattr(group_update,key):
#                 setattr(group_update, key, group[key])
#         # db.session.add(group_update)
#         # db.session.flush()
#         # return json(response,status=201)
#         updateGroupsUsers(members = members,group_id = group_update.id)
#         return json(to_dict(group_update),status=200)
#     else:
#         return json({
#             "error_code": "USER_NOT_FOUND",
#             "error_message":"USER_NOT_FOUND"
#         }, status = 520)
# def updateGroupsUsers(members,group_id):
#     all_roles = db.session.query(Role).all()
#     in_relation_ids = []
#     for member in members:
#         role_member = getRole(all_roles,member['role_name'])
#         if role_member != None and 'id' in member['info'].keys():
#             # CHECK EXISTS
#             check_member = db.session.query(GroupsUsers).filter(GroupsUsers.user_id == member['info']['id'],\
#                 GroupsUsers.group_id == group_id,GroupsUsers.role_id == role_member.id).first()
#             # is_relation_exist = db.session.query(literal(True)).filter(check_follower.exists()).scalar()
#             if check_member is not None:
#                 in_relation_ids.append(check_member.id)
#             else:
#                 new_relation = GroupsUsers(
#                     group_id = group_id,
#                     user_id = member['info']['id'],
#                     # user = User(**member['info']),
#                     role_id = role_member.id,
#                 )
#                 db.session.add(new_relation)
#                 db.session.flush()
#                 in_relation_ids.append(new_relation.id)
            
#     # DELETE ALL OTHER RELATIONS NOT IN in_relation_ids
#     db.session.query(GroupsUsers)\
#     .filter(~GroupsUsers.id.in_(in_relation_ids),GroupsUsers.group_id == group_id)\
#     .delete(synchronize_session=False)
#     db.session.commit()
# @app.route('/api/v1/group', methods=["GET"])
# def getGroup(request=None):
#     uid = auth.current_user(request)
#     if uid is not None:
#         page = request.args.get("page", None) or 1
#         results_per_page = request.args.get("results_per_page", None) or 50
#         offset=(int(page)-1)*int(results_per_page)

#         list_groups = db.session.query(Group.id,Group.group_name,Group.description)\
#         .join(GroupsUsers)\
#         .filter(GroupsUsers.user_id == uid,Group.deleted == False)\
#         .order_by(GroupsUsers.created_at.desc()).limit(results_per_page).offset(offset).all()
#         # list_groups = db.session.query(Group.id,Group.group_name,Group.description).filter(Group.members.any(User.id == uid),Group.deleted == False).order_by(Group.created_at.desc()).limit(results_per_page).offset(offset).all()
#         # print(list_groups)
#         result = []
#         id_role_admin = db.session.query(Role.id).filter(Role.role_name == 'admin')
#         for group in list_groups:
#             group_append = {}
#             group_append = {'id':str(group[0]),'group_name':group[1],'description':group[2]} 
#             total_members = db.session.query(func.count(GroupsUsers.user_id)).filter(GroupsUsers.group_id==group[0]).scalar()
#             group_append['total_members'] = total_members

#             check_current_user_is_member = db.session.query(func.count(GroupsUsers.user_id))\
#             .filter(GroupsUsers.group_id == group[0],GroupsUsers.user_id == uid,GroupsUsers.role_id != id_role_admin).scalar()
#             group_append['check_current_user_is_member'] = check_current_user_is_member

#             first_five_members = db.session.query(User.id,User.phone,User.email,User.display_name).join(GroupsUsers)\
#             .filter(GroupsUsers.group_id == group[0],GroupsUsers.role_id != id_role_admin).order_by(GroupsUsers.created_at.desc()).limit(5).all()
#             group_append['first_five_members'] = [{'id':str(member[0]),'phone':member[1],'email':member[2],'display_name':member[3]} for member in first_five_members]
            

#             total_admins = db.session.query(func.count(GroupsUsers.user_id)).filter(GroupsUsers.group_id==group[0],GroupsUsers.role_id == id_role_admin).scalar()
#             group_append['total_admins'] = total_admins

#             check_current_user_is_admin = db.session.query(func.count(GroupsUsers.user_id))\
#             .filter(GroupsUsers.group_id == group[0],GroupsUsers.user_id == uid,GroupsUsers.role_id == id_role_admin).scalar()
#             group_append['check_current_user_is_admin'] = check_current_user_is_admin

#             first_five_admins = db.session.query(User.id,User.phone,User.email,User.display_name).join(GroupsUsers)\
#             .filter(GroupsUsers.group_id == group[0],GroupsUsers.role_id == id_role_admin).order_by(GroupsUsers.created_at.desc()).limit(5).all()
#             group_append['first_five_admins'] = [{'id':str(member[0]),'phone':member[1],'email':member[2],'display_name':member[3]} for member in first_five_admins]

#             result.append(group_append)
#         return json({"num_results":len(result),"objects":result,"page":page})

#     else:
#         return json({
#             "error_code": "USER_NOT_FOUND",
#             "error_message":"USER_NOT_FOUND"
#         }, status = 520)

# @app.route('/api/v1/group/<group_id>', methods=["GET"])
# def getSigleGroup(request=None,group_id=None):
#     uid = auth.current_user(request)
#     if uid is not None:
#         group = db.session.query(Group.id,Group.group_name,Group.description).filter(Group.id == group_id).first()
#         result = {}
#         result['id'] = str(group[0])
#         result['group_name'] = group[1]
#         result['description'] = group[2]
#         result['members'] = []
#         members = db.session.query(GroupsUsers).filter(GroupsUsers.group_id == group[0]).all()
#         for member in members:
#             result['members'].append({
#                 'info':to_dict(member.user),
#                 'role_name':member.role.role_name
#             })
#         return json(result,status=200)
#     else:
#         return json({
#             "error_code": "USER_NOT_FOUND",
#             "error_message":"USER_NOT_FOUND"
#         }, status = 520)


# def getManyGroup(request=None, search_params=None, **kwargs):
#     uid = auth.current_user(request)
#     if uid is not None:
#         if 'filters' in search_params and bool(search_params["filters"]):
#             filters = search_params["filters"]
#             if "$and" in filters:
#                 search_params["filters"]['$and'].append({"user_id":{"$eq": uid}})
#             else:
#                 search_params["filters"]={}
#                 search_params["filters"]['$and'] = [{"user_id":{"$eq": uid}},filters]
#         else:
#             search_params["filters"] = {'$and':[{"user_id":{"$eq": uid}}]}
#     else:
#         return json({
#             "error_code": "USER_NOT_FOUND",
#             "error_message":"USER_NOT_FOUND"
#         }, status = 520)
# def getMyGroup(request=None, search_params=None, **kwargs):
#     uid = auth.current_user(request)
#     if uid is not None:
#         if 'filters' in search_params and bool(search_params["filters"]):
#             filters = search_params["filters"]
#             if "$and" in filters:
#                 search_params["filters"]['$and'].append({"created_by":{"$eq": uid}})
#             else:
#                 search_params["filters"]={}
#                 search_params["filters"]['$and'] = [{"created_by":{"$eq": uid}},filters]
#         else:
#             search_params["filters"] = {"created_by":{"$eq": uid}}
#     else:
#         return json({
#             "error_code": "USER_NOT_FOUND",
#             "error_message":"USER_NOT_FOUND"
#         }, status = 520)


# apimanager.create_api(collection_name='group_without_role', model=Group,
#     methods=['GET', 'POST', 'DELETE', 'PUT'],
#     url_prefix='/api/v1',
#     preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func,getMyGroup], POST=[auth_func,], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
#     postprocess=dict(POST=[auth_func], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[]),
#     )

# apimanager.create_api(collection_name='checklist', model=GroupsUsers,
#     methods=['GET', 'POST', 'DELETE', 'PUT'],
#     url_prefix='/api/v1',
#     preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func,getManyGroup], POST=[auth_func,], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
#     postprocess=dict(POST=[auth_func], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[]),
#     )
