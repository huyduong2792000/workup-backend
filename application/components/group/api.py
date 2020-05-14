from application.extensions import apimanager
from application.models.model import *
from gatco.exceptions import ServerError
from application.components import auth_func
from application.extensions import auth
from gatco.response import text, json
from application.components.user.model import User, Role
from application.components.group.model import Group,GroupsUsers
from application.server import app
from datetime import datetime
from sqlalchemy import and_, or_
import re
import json as to_json

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


@app.route('/api/v1/create_group', methods=["POST"])
def createGroup(request=None, data=None, Model=None):
    uid = auth.current_user(request)
    if uid is not None:
        group = request.json
        response = group
        group['unsigned_name'] = no_accent_vietnamese(group['group_name'])
        group['created_by'] = uid
        members = group['members']
        del group['members']
        new_group = Group(**group)
        db.session.add(new_group)
        db.session.flush()
        all_roles = db.session.query(Role).all()
        for member in members:
            role_member = getRole(all_roles,member['role_name'])
            if role_member != None and 'id' in member['info'].keys():
                new_group_user = GroupsUsers(
                    group_id = new_group.id,
                    group = new_group,
                    user_id = member['info']['id'],
                    # user = User(**member['info']),
                    role_id = role_member.id,
                    role = role_member,
                    created_by = uid
                )
                db.session.add(new_group_user)
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


# @app.route('/api/v1/get_list_members_group', methods=["POST"])
# def createGroup(request=None, data=None, Model=None):
#     uid = auth.current_user(request)
#     if uid is not None:
#         page = int(request.args.get("page", None))
#         results_per_page = int(request.args.get("results_per_page", None))
#         group_id = to_json.loads(request.args.get("q", None))["filters"]["group_id"]
#         list_members = db.session.query(GroupsUsers).filter(Task.group_id==group_id,Task.deleted==False).order_by(Task.created_at.desc()).limit(results_per_page).offset(offset).all()
#         return json(response,status=201)

#     else:
#         return json({
#             "error_code": "USER_NOT_FOUND",
#             "error_message":"USER_NOT_FOUND"
#         }, status = 520)
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
        if 'filters' in search_params and bool(search_params["filters"]):
            filters = search_params["filters"]
            if "$and" in filters:
                search_params["filters"]['$and'].append({"created_by":{"$eq": uid}})
            else:
                search_params["filters"]={}
                search_params["filters"]['$and'] = [{"created_by":{"$eq": uid}},filters]
        else:
            search_params["filters"] = {"created_by":{"$eq": uid}}
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)


apimanager.create_api(collection_name='group', model=Group,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func,getMyGroup], POST=[auth_func,], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
    postprocess=dict(POST=[auth_func], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[]),
    )

apimanager.create_api(collection_name='groups_users', model=GroupsUsers,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func,getManyGroup], POST=[auth_func,], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
    postprocess=dict(POST=[auth_func], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[]),
    )
# def remove_group_from_employee(data):
#     if data['supervisor']['id'] != data['supervisor_uid']:
#         employee_old = db.session.query(Employee).filter(Employee.id == data['supervisor_uid']).first()
#         task_groups_employee_old = list(employee_old.task_groups)
#         print("old=======",task_groups_employee_old)
#         for task_group in task_groups_employee_old:
#             if str(task_group.id) == str(data['id']):
#                 task_groups_employee_old.remove(task_group)
#         employee_old.task_groups = task_groups_employee_old
#         db.session.commit()


# def update_task_group(request=None, data=None, **kw):
#     print(data)
#     uid = auth.current_user(request)
#     if uid is not None:
#         data['created_by'] = uid
#         data['unsigned_name'] = no_accent_vietnamese(data['name'])
#         data['supervisor_uid'] = data['supervisor']['id']
#         if(data['deleted'] is False):
#            remove_group_from_employee(data)

#     else:
#         return json({
#             "error_code": "USER_NOT_FOUND",
#             "error_message":"USER_NOT_FOUND"
#         }, status = 520)


# def filter_task_group(request=None, search_params=None, **kwargs):
#     uid = auth.current_user(request)
#     if uid is not None:
#         if 'filters' in search_params:
#             filters = search_params["filters"]
#             if "$and" in filters:
#                 # search_params["filters"]['$and'].append({"active":{"$eq": 1}})
#                 search_params["filters"]['$and'].append({"deleted":{"$eq": False}})
#                 search_params["filters"]['$and'].append({"created_by":{"$eq": uid}})
#             else:
#                 search_params["filters"]['$and'] = [{"deleted":{"$eq": False} } ]
#         else:
#             search_params["filters"] = {'$and':[{"deleted":{"$eq": False}}]}
#     else:
#         return json({
#             "error_code": "USER_NOT_FOUND",
#             "error_message":"USER_NOT_FOUND"
#         }, status = 520)   
        


# @app.route('/api/v1/task_group_delete_multiple',methods=['PUT'])
# async def delete_multiple(request):
#     param = request.json
#     # print(param)
#     list_id_select = [data['id'] for data in param['data_delete']]
#     groups = db.session.query(TaskGroup).filter(TaskGroup.id.in_(list_id_select)).all()
#     for group in groups:
#         group.deleted = True
#         db.session.add(group)
#     db.session.commit()
#     return json({
#             "message": "DELETE_SUCCESS",
#             }, status = 200)
# @app.route('/api/v1/tasks_today', methods=["GET", "OPTIONS"])
# async def getTaskToday(request):
#     uid = auth.current_user(request)
#     if uid is not None:
#         start_time = request.args.get("start_time", None)
#         end_time = request.args.get("end_time", None)
#         status = request.args.get("status", None) 
        
#         list_group_uid = []
#         user = db.session.query(User).filter(User.id == uid).first()
#         if(checkHasRoleAdmin(user.roles) is True):
#             task_groups = db.session.query(TaskGroup).filter(TaskGroup.deleted == False).all()
#         else:
#             task_groups = user.employee.task_groups

#         for task_group in task_groups:
#             if(task_group.deleted is False):
#                 list_group_uid.append(task_group.id)
#         if start_time is None and end_time is None:
#             now = datetime.now()
#             start_day = datetime(year=now.year, month=now.month,day=now.day,
#                                 hour=0,minute=0,second=0,microsecond=0)
#             end_day = datetime(year=now.year, month=now.month,day=now.day,
#                                 hour=23,minute=59,second=59,microsecond=999)
#             start_time = datetime.timestamp(start_day)

#             end_time = datetime.timestamp(end_day)
#         if status is not None:
#             tasks_today = db.session.query(Tasks,TaskInfo).select_from(Tasks).join(TaskInfo).filter(and_(
#                 Tasks.task_info_uid == TaskInfo.id,
#                 Tasks.status == status,
#                 Tasks.start_time >= start_time,
#                 or_(Tasks.end_time <= end_time,Tasks.end_time == None ),
#                 TaskInfo.task_group_uid.in_(list_group_uid)
#                 )).all()
#         else:
#             tasks_today = db.session.query(Tasks,TaskInfo).select_from(Tasks).join(TaskInfo).filter(and_(
#                 Tasks.task_info_uid == TaskInfo.id,
#                 Tasks.start_time >= start_time,
#                 or_(Tasks.end_time <= end_time,Tasks.end_time == None ),
#                 TaskInfo.task_group_uid.in_(list_group_uid)
#                 )).all()
#         return json(convertTaskToday(tasks_today))
#     else:
#         return json({
#             "error_code": "USER_NOT_FOUND",
#             "error_message":"USER_NOT_FOUND"
#         }, status = 520)
# def checkHasRoleAdmin(roles):
#     for role in roles:
#         if role.role_name =="admin":
#             return True
#     return False
# def convertTaskToday(tasks_today):
#     tasks_groupby = groupbyTaskToday(tasks_today)
#     group_result = {}
#     groups_result = []
#     for task_groupby in tasks_groupby:
#         group_result = {
#             "id": str(task_groupby['group'].id),
#             "name":task_groupby['group'].name,
#             "unsigned_name":task_groupby['group'].unsigned_name,
#             "description":task_groupby['group'].description,
#             "priority":task_groupby['group'].priority,
#             "supervisor_uid":str(task_groupby['group'].supervisor_uid),
#             "supervisor":validEmployee(task_groupby['group'].supervisor),
#             "created_by": str(task_groupby['group'].created_by),
#             "tasks":[]
#         }
#         for task in task_groupby['tasks']:
#             obj = {
#             "id": str(task.id),
#             "task_uid": str(task.id),
#             "task_code": task.task_code,
#             "task_name": task.task_name,
#             "employees": [validEmployee(employee) for employee in task.employees],
#             "start_time": task.start_time,
#             "end_time": task.end_time,
#             "status": task.status,
#             "priority":task.priority,
#             "created_by": str(task.created_by),
#             }
#             group_result['tasks'].append(obj)
#         groups_result.append(group_result)
#     return groups_result
# def groupbyTaskToday(tasks_today):
#     #tasks_today example:
#     # [(<Tasks cddb29e9-b439-4d62-8995-d464262f39d4>, <TaskInfo 633b02cc-4219-43a6-88fa-90883fdb4656>),
#     # (<Tasks 78fcda26-e859-4075-b307-f9b908d636b0>, <TaskInfo 633b02cc-4219-43a6-88fa-90883fdb4656>)]
#     tasks_groupby = []
#     obj = {}
#     for task_today in tasks_today:
#         index_task_today_in_tasks_groupby = findIndex(task_today,tasks_groupby)
#         if index_task_today_in_tasks_groupby != -1:
#             tasks_groupby[index_task_today_in_tasks_groupby]['tasks'].append(task_today[0])
#         else:
#             tasks_groupby.append({"group":task_today[1].task_group,"tasks":[task_today[0]]})
#     return tasks_groupby

# def findIndex(task_today, tasks_groupby):
#     for index,task_groupby in enumerate(tasks_groupby,start=0):
#         if str(task_groupby['group'].id) == str(task_today[1].task_group_uid):
#             return index
#     return -1
# def validEmployee(employee):
#     result = employee.__dict__.copy()
#     key_remove = ['_sa_instance_state','task_groups',"created_at", "created_by",
#      "updated_at", "updated_by",'deleted_at']
#     for key in key_remove:
#             if key in result:
#                 del(result[key])
#     result['id'] = str(result['id'])    
#     return result