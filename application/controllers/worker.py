from gatco.response import json, text
from application.server import app
from application.database import db
from application.extensions import auth
import random
import string
from application.extensions import apimanager
from application.models.model import User, Tasks,TaskSchedule,Worker
from application.controllers import auth_func
from sqlalchemy import and_, or_
from math import floor
from datetime import datetime
import schedule
import time
from threading import Thread
import asyncio

# def job():
#     print("I'm working...=============================================================")

# schedule.every().day.at("09:38").do(job)

def createWorker():
    now = datetime.timestamp(datetime.now())
    print('now============',now)
    task_schedules = db.session.query(TaskSchedule).filter(and_(TaskSchedule.active==1,TaskSchedule.deleted == False\
    ,TaskSchedule.start_time_working <= now,TaskSchedule.end_time_working > now)).all()

    for task_schedule in task_schedules:
        list_day_of_week = getListDayOfWeek(task_schedule.day_of_week)
        dayindex_today = getDayindexToday()
        check = CheckIndexTodayInList(dayindex_today,list_day_of_week)
        if (check is True):
            tasks = task_schedule.Tasks
            
            for task in tasks:
                for employee in task.employees:
                    worker = Worker()
                    worker.task_name = task.task_name
                    worker.parent_code = task.parent_code
                    worker.task_code = task.task_code
                    worker.task_uid = task.id
                    worker.employee_uid = employee.id
                    worker.employee_name = employee.full_name
                    db.session.add(worker)
        else:
            pass
    db.session.commit()
    pass

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
    schedule.every().day.at("21:40").do(createWorker)
    asyncio.set_event_loop(asyncio.new_event_loop())
    while True:
        schedule.run_pending()
        time.sleep(1)
Thread(target = runSchedule).start()
