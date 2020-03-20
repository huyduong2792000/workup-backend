from gatco.response import json, text
from application.server import app
from application.database import db
from application.extensions import auth
import random
import string
from application.extensions import apimanager
from application.models.model import User, Tasks,TaskSchedule
from application.controllers import auth_func
from sqlalchemy import and_, or_
from math import floor
from datetime import datetime
import schedule
import time
from threading import Thread
# def job():
#     print("I'm working...=============================================================")

# # schedule.every().day.at("09:38").do(job)
# schedule.every(5).seconds.do(job)

# def run_schedule():
#     while True:
#         schedule.run_pending()
#         pass
# Thread(target = run_schedule).start()

def create_taskschedule(request=None, data=None, **kw):

    uid = auth.current_user(request)
    if uid is not None:
        data['created_by'] = uid
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)
    
def filter_taskschedule(request=None, search_params=None, **kwargs):
    uid = auth.current_user(request)
    if uid is not None:
        print('search_params=====================',search_params)
        if 'filters' in search_params:
            filters = search_params["filters"]
            if "$and" in filters:
                # search_params["filters"]['$and'].append({"active":{"$eq": 1}})
                search_params["filters"]['$and'].append({"created_by":{"$eq": uid}})
            else:
                search_params["filters"]['$and'] = [{"created_by":{"$eq": uid}}]
        else:
            search_params["filters"] = {'$and':[{"created_by":{"$eq": uid}} ]}

    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)   
        
        
apimanager.create_api(
        collection_name='task_schedule', model=TaskSchedule,
        methods=['GET', 'POST', 'DELETE', 'PUT'],
        url_prefix='/api/v1',
        preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func,filter_taskschedule], POST=[auth_func,create_taskschedule], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
        postprocess=dict(POST=[], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[])
    )

