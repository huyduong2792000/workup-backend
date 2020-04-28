""" Module represents a User. """
from sqlalchemy import (
    Column, String, Integer,
    BigInteger, Date, Boolean,
    ForeignKey, Float,UniqueConstraint
)

from sqlalchemy import (
    Column, String, Integer, BigInteger, Date, Boolean, DECIMAL, ForeignKey, Text, SmallInteger
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, backref
from application.components.user.model import User,Role
from application.database import db
from application.database.model import CommonModel, default_uuid
from application.components.organization.model import *



# class Role(CommonModel):
#     __tablename__ = 'role'
#     __table_args__ = {'extend_existing': True}
#     role_name = db.Column(String(100), index=True, nullable=False, unique=True)
#     display_name = db.Column(String(255), nullable=False)
#     description = db.Column(String(255))
#     active = db.Column(SmallInteger(), default=1)
#     # user = db.relationship("User", secondary="roles_users")


# class User(CommonModel):
#     __tablename__ = 'user'
#     __table_args__ = {'extend_existing': True}
#     # Authentication Attributes.
#     user_name = db.Column(String(255), nullable=False, index=True)
#     full_name = db.Column(String(255), nullable=True)
#     email = db.Column(String(255), nullable=False, index=True)
#     phone = db.Column(String(255), nullable=False, index=True,unique=True)
#     password = db.Column(String(255), nullable=False)
#     salt = db.Column(String(255), nullable=False)
#     is_active = db.Column(Boolean, default=True)
#     role_id = db.Column(UUID(as_uuid=True), ForeignKey('role.id',onupdate='cascade',ondelete='cascade'), primary_key=True)
#     role = db.relationship("Role")

#     def __repr__(self):
#         """ Show user object info. """
#         return '<User: {}>'.format(self.id)


class GroupsUsers(CommonModel):
    __tablename__ = 'groups_users'
    group_id = db.Column(UUID(as_uuid=True), ForeignKey('group.id',onupdate='cascade',ondelete='cascade'))
    group = db.relationship("Group")
    user_id = db.Column(UUID(as_uuid=True), ForeignKey('user.id',onupdate='cascade',ondelete='cascade'))
    user = db.relationship("User")
    role_id = db.Column(UUID(as_uuid=True), ForeignKey('role.id',onupdate='cascade',ondelete='cascade'))
    role = db.relationship("Role")
    _table_args_ = (UniqueConstraint('group_id', 'user_id', 'role_id', name='uq_groups_users_group_id_user_id_role_id'),)


         
class Group(CommonModel):
    __tablename__ = 'group'
    group_name = db.Column(String)
    unsigned_name = db.Column(String)
    description = db.Column(String)
    # priority = db.Column(SmallInteger)
    member = db.relationship("User",secondary="groups_users")


class FollowerTask(db.Model):
    __tablename__ = 'followers_tasks'
    user_id = db.Column(UUID(as_uuid=True), ForeignKey('user.id',onupdate='cascade',ondelete='cascade'), primary_key=True)
    task_id = db.Column(UUID(as_uuid=True), ForeignKey('task.id',onupdate='cascade',ondelete='cascade'), primary_key=True)
    created_at = db.Column(Date)
    note = db.Column(Text())


class Tasks(CommonModel):
    __tablename__='task'
    task_code = db.Column(String(32), index=True, unique=False, nullable=False)
    task_name = db.Column(String(255), nullable=False)
    unsigned_name = db.Column(String(255), nullable=True, index=True) # tên không dấu phục vụ truy vấn dữ liệu lớn
#     sub_task = db.Column(Boolean, default=False) # Nếu là subtask thì bắt buộc phải có parent mới cho lưu vào

    parent_id = db.Column(UUID(as_uuid=True), ForeignKey("task.id"))
    assignee_id = db.Column(UUID(as_uuid=True), ForeignKey("user.id"))
    assignee = db.relationship("User")
    followers = db.relationship("User",secondary="followers_tasks")
    task_info_id = db.Column(UUID(as_uuid=True), ForeignKey("task_info.id"))
    task_info = db.relationship("TaskInfo")
    tags = db.Column(JSONB())
    priority = db.Column(SmallInteger, index=True, default=2) # {1: highest, 2: high, 3: low, 4: lowest}
    attach_file = db.Column(String(255))
    link_issue = db.Column(String(255))
    original_estimate = db.Column(Integer) # minute unit 
    start_time = db.Column(BigInteger(), index=True, nullable=False)
    end_time = db.Column(BigInteger(), index=True, nullable=True)
    status = db.Column(SmallInteger, index=True, default=0) # {0: todo, "2: processing ", "1: done"}
    rating = db.Column(SmallInteger)
    comments = db.Column(JSONB())
    description = db.Column(String(255))
    active = db.Column(SmallInteger, default=1)
    # group_id 


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


class TaskInfo(CommonModel):
    __tablename__ = 'task_info'
    task_id = db.Column(String(255))
    task_name = db.Column(String)
    group_id = db.Column(UUID(as_uuid=True), ForeignKey("group.id"), nullable=False)
    group = db.relationship("Group")
    unsigned_name = db.Column(String, index=True)
    description = db.Column(String)
    tags = db.Column(JSONB())
    active = db.Column(SmallInteger, default=1)


class TimeSheet(CommonModel):
    __tablename__ = 'timesheet'
    user = db.relationship("User")
    user_id = db.Column(UUID(as_uuid=True), ForeignKey('user.id', onupdate='CASCADE', ondelete='SET NULL'), index=True, nullable=False)
    start_time_working = db.Column(BigInteger())
    end_time_working = db.Column(BigInteger())
    year = db.Column(Integer)
    month = db.Column(Integer)
    day = db.Column(Integer)
    hour  = db.Column(Integer)
    minute  = db.Column(Integer)
    
# organization_workstation = db.Table(
#     "organization_workstation",
#     db.Column("organization_id", UUID(as_uuid=True), db.ForeignKey("organization.id", ondelete="cascade")),
#     db.Column("workstation_id", UUID(as_uuid=True), db.ForeignKey("workstation.id", ondelete="cascade"))
# )
 
# employee_workstation = db.Table(
#     "employee_workstation",
#     db.Column("employee_id", UUID(as_uuid=True), db.ForeignKey("employee.id", ondelete="cascade")),
#     db.Column("workstation_id", UUID(as_uuid=True), db.ForeignKey("workstation.id", ondelete="cascade"))
# )

# class Workstation(CommonModel):
#     __tablename__ = 'workstation'
#     name = db.Column(String)
#     organization = db.relationship("Organization")
#     organization_uid = db.Column(UUID(as_uuid=True), ForeignKey('organization.id', onupdate='CASCADE', ondelete='SET NULL'), index=True, nullable=False)
#     address = db.Column(String(255))





class Notify(CommonModel):
    __tablename__ = 'notify'
    title = db.Column(String, index=True)
    content = db.Column(String)
    type = db.Column(String(20))  # text/image/video
    url = db.Column(String)
    iteminfo = db.Column(JSONB())
    notify_condition = db.Column(JSONB())
    
class NotifyUser(CommonModel):
    __tablename__ = 'notify_user'
    user_id = db.Column(String)
    notify = db.relationship("Notify")
    notify_uid = db.Column(UUID(as_uuid=True), ForeignKey('notify.id', onupdate='CASCADE', ondelete='SET NULL'), index=True, nullable=True)
#     notify_id = db.Column(String, ForeignKey('notify.id'), nullable=True)
#     notify = db.relationship('Notify')
    notify_at = db.Column(BigInteger())
    read_at = db.Column(BigInteger())


