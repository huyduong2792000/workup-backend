from sqlalchemy import (
    Column, String, Integer,Float, BigInteger, Date, Boolean, DECIMAL, ForeignKey, Text, SmallInteger,UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, backref
from application.database import db
from application.database.model import CommonModel, default_uuid
from application.components.user.model import User,Role
from application.components.task_info.model import TaskInfo

class TaskSchedule(CommonModel):
    __tablename__ = 'task_schedule'
    taskschedule_name = db.Column(String())
    # shift_of_day = db.Column(BigInteger()) #2^n
    start_time_working = db.Column(BigInteger(), default = 0) 
    end_time_working = db.Column(BigInteger(),default = 0) 
    active = db.Column(SmallInteger, default=1)
    task_scheduledetail = db.relationship('TaskScheduleDetail')


class TaskScheduleDetail(CommonModel):
    __tablename__ = 'task_scheduledetail'
    start_hours_working = db.Column(Float)
    end_hours_working = db.Column(Float)
    day_of_week = db.Column(BigInteger()) 
    week_number = db.Column(Integer,default=1)
    task_schedule_uid = db.Column(UUID(as_uuid=True), ForeignKey("task_schedule.id"))
    tasks_info = db.relationship("TaskInfo",
                            secondary="taskscheduledetail_taskinfo",
                            )

class TaskschedulesTaskinfo(CommonModel):
    __tablename__ = 'taskscheduledetail_taskinfo'
    task_uid = db.Column(UUID(as_uuid=True), ForeignKey('task_info.id',onupdate='cascade',ondelete='cascade'), primary_key=True)
    task = db.relationship("TaskInfo")
    task_schedule_uid = db.Column(UUID(as_uuid=True), ForeignKey('task_scheduledetail.id',onupdate='cascade',ondelete='cascade'), primary_key=True)
    task_schedule = db.relationship("TaskScheduleDetail")
