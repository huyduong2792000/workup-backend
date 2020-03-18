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
    


def filter_many_task(request=None, search_params=None, **kwargs):
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
    
    

def filter_many_mytasks(request=None, search_params=None, **kwargs):
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
            search_params["filters"]['$and'].append({"active":{"$eq": 1}, "employees":{"$any": uid}})
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)   
    



    
apimanager.create_api(
        collection_name='tasks', model=Tasks,
        methods=['GET', 'POST', 'DELETE', 'PUT'],
        url_prefix='/api/v1',
        preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[filter_many_task], POST=[create_task], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
        postprocess=dict(POST=[], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[])
    )


apimanager.create_api(
        collection_name='tasks_employees', model=TasksEmployees,
        methods=['GET', 'POST', 'DELETE', 'PUT'],
        url_prefix='/api/v1',
        preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[filter_many_task], POST=[create_task], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
        postprocess=dict(POST=[], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[])
    )