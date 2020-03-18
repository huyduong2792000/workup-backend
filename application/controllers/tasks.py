from gatco.response import json, text
from application.server import app
from application.database import db
from application.extensions import auth
import random
import string
from application.extensions import apimanager
from application.models.model import User, Tasks,Employee, TasksEmployees
from application.controllers import auth_func
from sqlalchemy import and_, or_
from hashids import Hashids
from math import floor
from datetime import datetime

hashids = Hashids(salt = "make task easy", alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")


def create_task(request=None, data=None, **kw):
    uid = auth.current_user(request)
    if uid is not None:
        data['created_by'] = uid
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
                search_params["filters"]['$and'].append({"active":{"$eq": 1}, "created_by":{"$eq": uid}})
            else:
                search_params["filters"] = {}
                search_params["filters"]['$and'] = []
                search_params["filters"]['$and'].append({"active":{"$eq": 1}, "created_by":{"$eq": uid}})
        else:
            search_params["filters"] = {}
            search_params["filters"]['$and'] = []
            search_params["filters"]['$and'].append({"active":{"$eq": 1}, "created_by":{"$eq": uid}})
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


# apimanager.create_api(
#         collection_name='tasks_employees', model=TasksEmployees,
#         methods=['GET', 'POST', 'DELETE', 'PUT'],
#         url_prefix='/api/v1',
#         preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[filter_tasks_employees], POST=[auth_func], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
#         postprocess=dict(POST=[], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[])
#     )




@app.route('/api/v1/tasks_employees', methods=["GET", "OPTIONS"])
async def tasks_employees(request):
    error_msg = None
    uid = auth.current_user(request)
    if uid is not None:
        user = db.session.query(User).filter(User.id == uid).first()
        
        tasks_employees = db.session.query(TasksEmployees).filter(TasksEmployees.employee_uid == user.employee_uid).all()
        list_task = []
        for task_employee in tasks_employees:
            task = task_employee.task
            employee = task_employee.employee
            obj = {
                "task_uid": task.id,
                "task_code": task.task_code,
                "task_name": task.task_name,
                "employee_uid": employee.id,
                "employee_name": employee.full_name,
                "employee_phone": employee.phone_number,
                "employee_position": employee.position,
                "start_time": task.start_time,
                "end_time": task.end_time,                
                }
            
        return json({})
    else:
        return json("ok")
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)