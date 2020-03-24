from gatco.response import json, text
from application.server import app
from application.database import db
from application.extensions import auth
import random
import string
from application.extensions import apimanager
from application.models.model import User, Tasks, Employee, TasksEmployees, TaskInfo
from application.controllers import auth_func
from sqlalchemy import and_, or_
from hashids import Hashids
from math import floor
import datetime
import time

hashids = Hashids(salt = "make task easy", alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")


def create_task(request=None, data=None, **kw):
    uid = auth.current_user(request)
    if uid is not None:
        data['created_by'] = uid
        if data['start_time'] is None:
            data['start_time']= time.mktime(datetime.datetime.combine(datetime.datetime.today(), datetime.time(00, 00, 00)).timetuple())
        if data['end_time'] is None:
            data['end_time'] = time.mktime(datetime.datetime.combine(datetime.datetime.today(), datetime.time(23, 59, 59)).timetuple())
#         print(data['end_time'] )
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
                search_params["filters"]['$and'].append({"created_by":{"$eq": uid}})
            else:
                search_params["filters"]['$and'] = [{"created_by":{"$eq": uid}}, {"deleted":{"$eq": False} } ]
        else:
            search_params["filters"] = {'$and':[{"created_by":{"$eq": uid}},{"deleted":{"$eq": False} } ]}
            
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)   
    
    


def filter_tasks_employees(request=None, search_params=None, **kwargs):
    uid = auth.current_user(request)
    if uid is not None:
        pass
    
#         if 'filters' in search_params:
#             filters = search_params["filters"]
#             if "$and" in filters:
#                 search_params["filters"]['$and'].append()
#             else:
#                 search_params["filters"] = {}
#                 search_params["filters"]['$and'] = []
#                 search_params["filters"]['$and'].append()
#         else:
#             search_params["filters"] = {}
#             search_params["filters"]['$and'] = []
#             search_params["filters"]['$and'].append()
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)  

    
apimanager.create_api(
        collection_name='tasks', model=Tasks,
        methods=['GET', 'POST', 'DELETE', 'PUT'],
        url_prefix='/api/v1',
        preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[filter_tasks], POST=[create_task], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
        postprocess=dict(POST=[], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[])
    )


apimanager.create_api(
        collection_name='task_info', model=TaskInfo,
        methods=['GET', 'POST', 'DELETE', 'PUT'],
        url_prefix='/api/v1',
        preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[], POST=[auth_func], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
        postprocess=dict(POST=[], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[])
    )

def process_employees_tasks(tasks_employees, my_tasks, user):
    list_task = []
    list_tasks_has_assignee =[]
    for task_employee in tasks_employees:
        task = task_employee.task
        employee = task_employee.employee
        
        user_create_task = db.session.query(User).filter(User.id == task.created_by).first()
       
        priority = task.priority
        
        if priority == 1:
            priority = "highest"
        if priority == 2:
            priority = "high"
        if priority == 3:
            priority = "low"
        if priority == 4:
            priority = "lowest"
                
        obj = {
            "id": str(task_employee.id),
            "task_uid": str(task.id),
            "task_code": task.task_code,
            "task_name": task.task_name,
            "employee_uid": str(employee.id),
            "employee_name": employee.full_name,
            "employee_phone": employee.phone_number,
            "employee_position": employee.position,
            "start_time": task.start_time,
            "end_time": task.end_time,
            "status": task.status,
            "priority":priority,
            "created_by": str(task.created_by),
            "created_by_name": user_create_task.full_name
            }
        list_task.append(obj)
        
        list_tasks_has_assignee.append(str(task.id))
    auto_id = 0
    
    
    for task in my_tasks:
        if str(task.id) not in list_tasks_has_assignee:
            employees = task.employees;
            list_name = []
            list_id = []
            for employee in employees:
                list_id.append(str(employee.id))
                list_name.append(employee.full_name)
                
            priority = task.priority
            if priority == 1:
                priority = "highest"
            if priority == 2:
                priority = "high"
            if priority == 3:
                priority = "low"
            if priority == 4:
                priority = "lowest"
            
             
            obj = {
            "id": str(auto_id),
            "task_uid": str(task.id),
            "task_code": task.task_code,
            "task_name": task.task_name,
            "employee_uid": list_id,
            "employee_name": list_name,
            "employee_phone": None,
            "employee_position": None,
            "start_time": task.start_time,
            "end_time": task.end_time,
            "status": task.status,
            "priority":priority,
            "created_by": str(task.created_by),
            "created_by_name": user.full_name
            }
            auto_id+=1
            list_tasks_has_assignee.append(str(task.id))
            
        list_task.append(obj)
    return list_task


@app.route('/api/v1/tasks_employees', methods=["GET", "OPTIONS"])
async def tasks_employees(request):
    error_msg = None
    uid = auth.current_user(request)
    if uid is not None:
        start_time = request.args.get("start_time", None)
        end_time = request.args.get("end_time", None)
        
        status = request.args.get("status", None)
        
        if start_time is None and end_time is None:
#             current_date = datetime.today().strftime('%Y-%m-%d')
            start_time = time.mktime(datetime.datetime.combine(datetime.datetime.today(), datetime.time(00, 00, 00)).timetuple())
            end_time = time.mktime(datetime.datetime.combine(datetime.datetime.today(), datetime.time(23, 59, 59)).timetuple())
        
        
        user = db.session.query(User).filter(User.id == uid).first()
        
        if status is not None:
            tasks_employees = db.session.query(TasksEmployees).join(Tasks).filter(and_(
                    TasksEmployees.task_uid == Tasks.id,
                    Tasks.status == status,
                    Tasks.start_time >= start_time,
                    Tasks.end_time <= end_time,
                    TasksEmployees.employee_uid == user.employee_uid
                    )).all()
                
            my_tasks = db.session.query(Tasks).filter(and_(
                    Tasks.created_by == uid,
                    Tasks.start_time >= start_time,
                    Tasks.end_time <= end_time,
                    Tasks.status == status,
                    )).all()
                
             
            return json(process_employees_tasks(tasks_employees, my_tasks, user))
        
        else:
            tasks_employees = db.session.query(TasksEmployees).join(Tasks).filter(and_(
                    TasksEmployees.task_uid == Tasks.id,
                    TasksEmployees.employee_uid == user.employee_uid,
                    Tasks.start_time >= start_time,
                    Tasks.end_time <= end_time,
                    )).all()
            my_tasks = db.session.query(Tasks).filter(and_(
                    Tasks.created_by == uid,
                    Tasks.start_time >= start_time,
                    Tasks.end_time <= end_time,
                    )).all()
                    
            return json(process_employees_tasks(tasks_employees, my_tasks, user))
        
        
    else:

        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)