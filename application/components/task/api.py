from gatco.response import json, text
from application.server import app
from application.database import db
from application.extensions import auth
import random
import string
from application.extensions import apimanager
from application.components.task.model import Task,FollowerTask
from application.components.user.model import User, Role
import json as to_json
from application.components import auth_func
from sqlalchemy import and_, or_,update, literal
from hashids import Hashids
from math import floor
import datetime
import time
from gatco_restapi.helpers import to_dict

import re

hashids = Hashids(salt = "make task easy", alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")
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


def convertNewTask(data,uid):
    data['created_by'] = uid
    data['unsigned_name'] = no_accent_vietnamese(data['task_name'])
    data['start_time']= time.mktime(datetime.datetime.combine(datetime.datetime.today(), datetime.time(00, 00, 00)).timetuple())
    # assignee = db.session.query(User).filter(User.id==data['assignee']['id']).first()
    assignee = data['assignee']
    del data['followers']
    del data['assignee']
    del data['note']
    new_task = Task(**data)
    if 'id' in assignee.keys():
        new_task.assignee_id = assignee['id']
    # new_task.assignee=assignee
    return new_task

@app.route('/api/v1/save_task', methods=["POST"])
def postTask(request=None,task_id=None, **kw):
    uid = auth.current_user(request)
    data = request.json
    if uid is not None:
            note = data['note']
            followers = data['followers']
            new_task = convertNewTask(data,uid)
            db.session.add(new_task)
            db.session.flush()
    
            for follower in followers:
                follower_task = FollowerTask(user_id = follower['id'],
                                            task_id = new_task.id,
                                            created_at = new_task.start_time,
                                            note = note)
                db.session.add(follower_task)
            db.session.commit()
            return json(request.json,status=201)
            
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)
    
@app.route('/api/v1/save_task/<task_id>', methods=['PUT'])
def putTask(request=None,task_id=None, **kw):
    uid = auth.current_user(request)
    data = request.json
    if uid is not None:
        in_relation_ids = []
        for follower in data['followers']:
            # CHECK EXISTS
            check_follower = db.session.query(FollowerTask).filter(FollowerTask.task_id == data['id'],\
                FollowerTask.user_id == follower['id']).first()
            # is_relation_exist = db.session.query(literal(True)).filter(check_follower.exists()).scalar()
            if check_follower is not None:
                in_relation_ids.append(check_follower.id)
                pass
            else:
                new_relation = FollowerTask(
                    user_id = follower['id'],
                    task_id = data['id'],
                    note = data['note'] or None,
                    )
                db.session.add(new_relation)
                db.session.flush()
                in_relation_ids.append(new_relation.id)
                
        # DELETE ALL OTHER RELATIONS NOT IN in_relation_ids
        db.session.query(FollowerTask).filter(~FollowerTask.id.in_(in_relation_ids),FollowerTask.task_id==data['id']).delete(synchronize_session=False)
        del data['task_info']
        del data['followers']
        # assignee = db.session.query(User).filter(User.id == data['assignee']['id']).first()
        try:
            data['assignee'] = db.session.query(User).filter(User.id == data['assignee']['id']).first()
        except:
            pass
        task_update = db.session.query(Task).filter(Task.id == task_id).first()
        # task_update.assignee = assignee
        for attr in data.keys():
            if hasattr(task_update, attr):
                setattr(task_update, attr, data[attr])
        # task_update.assignee = assignee
        db.session.add(task_update)
        db.session.commit()
        return json(to_dict(task_update),status=200)
            
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)

def filter_tasks(request=None, search_params=None, **kwargs):
    uid = auth.current_user(request)
    
    if uid is not None:
        if 'filters' in search_params:
            filters = search_params["filters"]
            if "$and" in filters:
                search_params["filters"]['$and'].append({"deleted":{"$eq": False}})
            else:
                search_params["filters"]={}
                search_params["filters"]['$and'] = [{"deleted":{"$eq": False}},filters]
        else:
            search_params["filters"] = {'$and':[{"assignee_id":{"$eq": None}},{"deleted":{"$eq": False} } ]}
            
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)   
    
@app.route('/api/v1/get_task_received_in_group', methods=["GET"])
def getTaskCreate(request):
    uid = auth.current_user(request)
    if uid is not None:
        page = request.args.get("page", None)
        results_per_page = request.args.get("results_per_page", None)
        group_id = to_json.loads(request.args.get("q", None))["filters"]["group_id"]
        offset=(int(page)-1)*int(results_per_page)
        task_received_not_done = db.session.query(Task).filter(
            Task.assignee_id == uid,
            Task.group_id == group_id,
            Task.status != 1,
            Task.deleted == False).order_by(Task.created_at.desc()).limit(results_per_page).offset(offset).all()
        task_received_done = db.session.query(Task).filter(
            Task.assignee_id == uid,
            Task.group_id == group_id,
            Task.status == 1,
            Task.deleted == False).order_by(Task.updated_at.desc()).limit(10).offset(offset).all()
        result=[]
        for task_create in task_received_not_done + task_received_done:
            result.append(to_dict(task_create))
        return json({"num_results":len(result),"objects":result,"page":page})
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)

@app.route('/api/v1/get_task_created_in_group', methods=["GET"])
def getTaskCreate(request):
    uid = auth.current_user(request)
    if uid is not None:
        page = request.args.get("page", None)
        results_per_page = request.args.get("results_per_page", None)
        group_id = to_json.loads(request.args.get("q", None))["filters"]["group_id"]
        offset=(int(page)-1)*int(results_per_page)

        tasks_created_not_done = db.session.query(Task).filter(
            Task.group_id == group_id,
            Task.status != 1,
            Task.deleted == False).order_by(Task.created_at.desc()).limit(results_per_page).offset(offset).all()
        tasks_created_done = db.session.query(Task).filter(
            Task.status == 1,
            Task.group_id == group_id,
            Task.deleted == False).order_by(Task.updated_at.desc()).limit(10).offset(offset).all()
        
        result=[]
        for task_create in tasks_created_not_done + tasks_created_done:
            result.append(to_dict(task_create))
        return json({"num_results":len(result),"objects":result,"page":page})
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)

@app.route('/api/v1/get_task_follower_in_group', methods=["GET"])
def getTaskFollower(request):
    uid = auth.current_user(request)
    if uid is not None:
        page = request.args.get("page", None)
        results_per_page = request.args.get("results_per_page", None)
        group_id = to_json.loads(request.args.get("q", None))["filters"]["group_id"]
        offset=(int(page)-1)*int(results_per_page)
        result=[]
        list_task_id=[]
        follower_tasks=db.session.query(FollowerTask).filter(FollowerTask.user_id == uid).all()
        for follower_task in follower_tasks:
            list_task_id.append(follower_task.task_id)

        task_follower_not_done = db.session.query(Task).filter(
            Task.id.in_(list_task_id),
            Task.group_id == group_id,
            Task.status != 1,
            Task.deleted == False).order_by(Task.created_at.desc()).limit(results_per_page).offset(offset).all()
        task_follower_done = db.session.query(Task).filter(
            Task.id.in_(list_task_id),
            Task.group_id == group_id,
            Task.status == 1,
            Task.deleted == False).order_by(Task.updated_at.desc()).limit(10).offset(offset).all()

        for task in task_follower_not_done + task_follower_done:
            result.append(to_dict(task))
        return json({"num_results":len(result),"objects":result,"page":page})
    else:
        return json({
                "error_code": "USER_NOT_FOUND",
                "error_message":"USER_NOT_FOUND"
            }, status = 520) 

@app.route('/api/v1/get_task_follower_by_me', methods=["GET"])
def getTaskFollower(request):
    uid = auth.current_user(request)
    if uid is not None:
        page = request.args.get("page", None)
        results_per_page = request.args.get("results_per_page", None)
        offset=(int(page)-1)*int(results_per_page)
        result=[]
        list_task_id=[]
        follower_tasks=db.session.query(FollowerTask).filter(FollowerTask.user_id == uid).all()
        for follower_task in follower_tasks:
            list_task_id.append(follower_task.task_id)
        task_follower_not_done = db.session.query(Task).filter(
            Task.id.in_(list_task_id),
            Task.group_id == None,
            Task.status != 1,
            Task.deleted == False).order_by(Task.created_at.desc()).limit(results_per_page).offset(offset).all()
        task_follower_done = db.session.query(Task).filter(
            Task.id.in_(list_task_id),
            Task.group_id == None,
            Task.status == 1,
            Task.deleted == False).order_by(Task.updated_at.desc()).limit(10).offset(offset).all()
        for task in task_follower_not_done + task_follower_done:
            result.append(to_dict(task))
        return json({"num_results":len(result),"objects":result,"page":page})
    else:
        return json({
                "error_code": "USER_NOT_FOUND",
                "error_message":"USER_NOT_FOUND"
            }, status = 520) 
@app.route('/api/v1/get_task_received_by_me', methods=["GET"])
def getTaskCreate(request):
    uid = auth.current_user(request)
    if uid is not None:
        page = request.args.get("page", None) or 1
        results_per_page = request.args.get("results_per_page", None) or 50
        offset=(int(page)-1)*int(results_per_page)

        task_received_not_done = db.session.query(Task).filter(
            Task.assignee_id == uid,
            Task.deleted == False,
            Task.status != 1,
            Task.group_id == None).order_by(Task.created_at.desc()).limit(results_per_page).offset(offset).all()
        
        task_received_done = db.session.query(Task).filter(
            Task.assignee_id == uid,
            Task.status == 1,
            Task.group_id == None,
            Task.deleted == False).order_by(Task.updated_at.desc()).limit(10).offset(offset).all()
        result=[]
        for task_create in task_received_not_done + task_received_done:
            result.append(to_dict(task_create))
        return json({"num_results":len(result),"objects":result,"page":page})
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520) 

@app.route('/api/v1/get_task_created_by_me', methods=["GET"])
def getTaskCreate(request):
    uid = auth.current_user(request)
    if uid is not None:
        page = request.args.get("page", None)
        results_per_page = request.args.get("results_per_page", None)
        offset = (int(page)-1)*int(results_per_page)
        tasks_created_not_done = db.session.query(Task).filter(
            or_(Task.assignee_id != uid,Task.assignee_id == None),
            Task.created_by == uid,
            Task.deleted == False,
            Task.status != 1,
            Task.group_id == None).order_by(Task.created_at.desc()).limit(results_per_page).offset(offset).all()
        tasks_created_done = db.session.query(Task).filter(
            or_(Task.assignee_id != uid,Task.assignee_id == None),
            Task.created_by == uid,
            Task.deleted == False,
            Task.status == 1,
            Task.group_id == None).order_by(Task.updated_at.desc()).limit(10).offset(offset).all()
        result=[]
        for task_create in tasks_created_not_done + tasks_created_done:
            result.append(to_dict(task_create))
        return json({"num_results":len(result),"objects":result,"page":page})
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520) 
def createTask(request=None,data=None, **kw):
    uid = auth.current_user(request)
    if uid is not None:
        data['created_by'] = uid
        data['unsigned_name'] = no_accent_vietnamese(data['task_name'])
        data['start_time']= time.mktime(datetime.datetime.combine(datetime.datetime.today(), datetime.time(00, 00, 00)).timetuple())
        
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)
apimanager.create_api(
        collection_name='task', model=Task,
        methods=['GET', 'POST', 'DELETE', 'PUT'],
        url_prefix='/api/v1',
        preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[filter_tasks], POST=[createTask], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
        postprocess=dict(POST=[], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[])
    )


# # apimanager.create_api(
# #         collection_name='task_info', model=TaskInfo,
# #         methods=['GET', 'POST', 'DELETE', 'PUT'],
# #         url_prefix='/api/v1',
# #         preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[], POST=[auth_func], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
# #         postprocess=dict(POST=[], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[])
# #     )

# def process_employees_tasks(tasks_employees, my_tasks, user):
#     list_task = []
#     list_tasks_has_assignee =[]
#     for task_employee in tasks_employees:
#         task = task_employee.task
#         employee = task_employee.employee
        
#         user_create_task = db.session.query(User).filter(User.id == task.created_by).first()
       
#         priority = task.priority
        
#         if priority == 1:
#             priority = "highest"
#         if priority == 2:
#             priority = "high"
#         if priority == 3:
#             priority = "low"
#         if priority == 4:
#             priority = "lowest"
                
#         obj = {
#             "id": str(task_employee.id),
#             "task_uid": str(task.id),
#             "task_code": task.task_code,
#             "task_name": task.task_name,
#             "employee_uid": str(employee.id),
#             "employee_name": employee.full_name,
#             "employee_phone": employee.phone_number,
#             "employee_position": employee.position,
#             "start_time": task.start_time,
#             "end_time": task.end_time,
#             "status": task.status,
#             "priority":priority,
#             "created_by": str(task.created_by),
#             "created_by_name": user_create_task.full_name
#             }
#         list_task.append(obj)
        
#         list_tasks_has_assignee.append(str(task.id))
#     auto_id = 0
    
    
#     for task in my_tasks:
#         if str(task.id) not in list_tasks_has_assignee:
#             employees = task.employees;
#             list_name = []
#             list_id = []
#             for employee in employees:
#                 list_id.append(str(employee.id))
#                 list_name.append(employee.full_name)
                
#             priority = task.priority
#             if priority == 1:
#                 priority = "highest"
#             if priority == 2:
#                 priority = "high"
#             if priority == 3:
#                 priority = "low"
#             if priority == 4:
#                 priority = "lowest"
            
             
#             obj = {
#             "id": str(auto_id),
#             "task_uid": str(task.id),
#             "task_code": task.task_code,
#             "task_name": task.task_name,
#             "employee_uid": list_id,
#             "employee_name": list_name,
#             "employee_phone": None,
#             "employee_position": None,
#             "start_time": task.start_time,
#             "end_time": task.end_time,
#             "status": task.status,
#             "priority":priority,
#             "created_by": str(task.created_by),
#             "created_by_name": user.full_name
#             }
#             auto_id+=1
#             list_tasks_has_assignee.append(str(task.id))
            
#         list_task.append(obj)
#     return list_task


# @app.route('/api/v1/tasks_employees', methods=["GET", "OPTIONS"])
# async def tasks_employees(request):
#     error_msg = None
#     uid = auth.current_user(request)
#     if uid is not None:
#         start_time = request.args.get("start_time", None)
#         end_time = request.args.get("end_time", None)
        
#         status = request.args.get("status", None)
        
#         if start_time is None and end_time is None:
# #             current_date = datetime.today().strftime('%Y-%m-%d')
#             start_time = time.mktime(datetime.datetime.combine(datetime.datetime.today(), datetime.time(00, 00, 00)).timetuple())
#             end_time = time.mktime(datetime.datetime.combine(datetime.datetime.today(), datetime.time(23, 59, 59)).timetuple())
        
        
#         user = db.session.query(User).filter(User.id == uid).first()
        
#         if status is not None:
#             tasks_employees = db.session.query(TasksEmployees).join(Tasks).filter(and_(
#                     TasksEmployees.task_uid == Tasks.id,
#                     Tasks.status == status,
#                     Tasks.start_time >= start_time,
#                     Tasks.end_time <= end_time,
#                     TasksEmployees.employee_uid == user.employee_uid
#                     )).all()
                
#             my_tasks = db.session.query(Tasks).filter(and_(
#                     Tasks.created_by == uid,
#                     Tasks.start_time >= start_time,
#                     Tasks.end_time <= end_time,
#                     Tasks.status == status,
#                     )).all()
                
             
#             return json(process_employees_tasks(tasks_employees, my_tasks, user))
        
#         else:
#             tasks_employees = db.session.query(TasksEmployees).join(Tasks).filter(and_(
#                     TasksEmployees.task_uid == Tasks.id,
#                     TasksEmployees.employee_uid == user.employee_uid,
#                     Tasks.start_time >= start_time,
#                     Tasks.end_time <= end_time,
#                     )).all()
#             my_tasks = db.session.query(Tasks).filter(and_(
#                     Tasks.created_by == uid,
#                     Tasks.start_time >= start_time,
#                     Tasks.end_time <= end_time,
#                     )).all()
                    
#             return json(process_employees_tasks(tasks_employees, my_tasks, user))
        
        
#     else:

#         return json({
#             "error_code": "USER_NOT_FOUND",
#             "error_message":"USER_NOT_FOUND"
#         }, status = 520)

# @app.route('api/v1/set_task_status', methods=["PUT"])
# async def set_task_status(request):
#     uid = auth.current_user(request)
#     task_id = request.args.get('id',None)
#     method_change_employee = request.args.get('method',None)
#     user = db.session.query(User).filter(User.id == uid).first()
#     if (user.employee_uid is None):
#         return json({
#             "error_code": "EMPLOYEE_NOT_FOUND",
#             "error_message":"EMPLOYEE_NOT_FOUND"
#         }, status = 520)
#     else:
#         task =  db.session.query(Task).filter(Task.id == task_id).first()
        
#         list_employee = list(task.employees)
#         if method_change_employee == "add_employee" and user.employee is not None:
#             task.status = 2 #processing
#             list_employee.append(user.employee)
#             task.employees = list_employee

#         elif method_change_employee == "remove_employee":
#             for i in range(len(list_employee)):
#                 if(str(list_employee[i].id) == str(user.employee.id)):
#                     list_employee.pop(i)
#             task.employees = list_employee
#             task.status = 0 if list_employee == [] else 2 #0:todo
#         elif method_change_employee == "done":
#             task.status = 1 #done
#             end_time = datetime.datetime.now()

#         db.session.add(task)
#         db.session.commit()
#         return json(to_dict(task))
# def validEmployee(employee):
#     result = employee.__dict__.copy()
#     key_remove = ['_sa_instance_state','task_groups',"created_at", "created_by",
#      "updated_at", "updated_by",'deleted_at']
#     for key in key_remove:
#             if key in result:
#                 del(result[key])
#     result['id'] = str(result['id'])    
#     return result

# def validTask(task):
#     result = {
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
#     return result