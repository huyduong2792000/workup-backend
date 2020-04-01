from gatco.response import json, text
from application.server import app
from application.database import db
from application.extensions import auth
import random
import string
from application.extensions import apimanager
from application.models.model import Tasks,TaskSchedule
from application.components import auth_func
from application.extensions import auth

from sqlalchemy import and_, or_
from math import floor
from datetime import datetime
import schedule
import time
import asyncio
from application import config

def createTasks():
    now = datetime.now()
    start_day = datetime(year=now.year, month=now.month,day=now.day,
                        hour=0,minute=0,second=0,microsecond=0)
    end_day = datetime(year=now.year, month=now.month,day=now.day,
                        hour=23,minute=59,second=59,microsecond=999)
    start_day_timestamp = datetime.timestamp(start_day)
    
    end_day_timestamp = datetime.timestamp(end_day)

    task_schedules = db.session.query(TaskSchedule).filter(and_(TaskSchedule.active==1,TaskSchedule.deleted == False\
    ,or_(
        (and_(TaskSchedule.start_time_working <= start_day_timestamp,TaskSchedule.end_time_working >= start_day_timestamp)),
        (and_(TaskSchedule.start_time_working >= start_day_timestamp,TaskSchedule.start_time_working <= end_day_timestamp))
    ))).all()
    for task_schedule in task_schedules:
        list_day_of_week = getListDayOfWeek(task_schedule.day_of_week)
        dayindex_today = getDayindexToday()
        check = CheckIndexTodayInList(dayindex_today,list_day_of_week)
        if (check is True):
            print('clone process')
            for task in task_schedule.Tasks:
                new_task = Tasks()
                new_task.status = 0
                new_task.task_many_times = False
                new_task.created_by = task_schedule.created_by
                new_task.task_code = task.task_code
                new_task.task_name = task.task_name
                new_task.unsigned_name = task.unsigned_name
                new_task.task_info_uid = task.id
                new_task.task_info = task
                # new_task.parent_code = task.parent_code
                # new_task.priority = task.priority
                # new_task.attach_file = task.attach_file
                # new_task.link_issue = task.link_issue
                # new_task.original_estimate = task.original_estimate
                new_task.description = task.description
                new_task.tags = task.tags
                new_task.start_time = start_day_timestamp
                new_task.end_time = end_day_timestamp
                db.session.add(new_task)
        else:
            pass
    db.session.commit()

def CheckIndexTodayInList(dayindex_today,list_day_of_week):
    try:
        list_day_of_week.index(dayindex_today)
        return True
    except:
        return False

def getListDayOfWeek(day_of_week):
    list_day_of_week = []
    for i in range(0,7):
        if 2 **i & day_of_week:
            list_day_of_week.append(i)
    return list_day_of_week

def getDayindexToday():
    today = datetime.today()
    dayindex_today = int(today.strftime("%w")) - 1
    if (dayindex_today == -1):
        dayindex_today = 6
    return dayindex_today

def runSchedule():
    schedule.every().day.at(config.Config.TIME_CRON_JOB).do(createTasks)
    # schedule.every(2).seconds.do(createTasks)
    asyncio.set_event_loop(asyncio.new_event_loop())
    while True:
        schedule.run_pending()
        time.sleep(1)


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
        if 'filters' in search_params:
            filters = search_params["filters"]
            if "$and" in filters:
                # search_params["filters"]['$and'].append({"active":{"$eq": 1}})
                search_params["filters"]['$and'].append({"deleted":{"$eq": False}})
                search_params["filters"]['$and'].append({"created_by":{"$eq": uid}})
            else:
                search_params["filters"]['$and'] = [{"created_by":{"$eq": uid}}, {"deleted":{"$eq": False} } ]
        else:
            search_params["filters"] = {'$and':[{"created_by":{"$eq": uid}},{"deleted":{"$eq": False}}]}

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

