""" Module represents a User. """
from sqlalchemy import (
    Column, String, Integer,
    BigInteger, Date, Boolean,
    ForeignKey, Float
)

from sqlalchemy import (
    Column, String, Integer, BigInteger, Date, Boolean, DECIMAL, ForeignKey, Text, SmallInteger
)
from sqlalchemy.dialects.postgresql import UUID, JSONB


from sqlalchemy.orm import relationship, backref

from application.database import db
from application.database.model import CommonModel, default_uuid
roles_users = db.Table('roles_users',
                       db.Column('user_uid', UUID(as_uuid=True), db.ForeignKey('user.id')),
                       db.Column('role_uid', UUID(as_uuid=True), db.ForeignKey('role.id')))

class Role(CommonModel):
    __tablename__ = 'role'
    role_name = db.Column(String(100), index=True, nullable=False, unique=True)
    display_name = db.Column(String(255), nullable=False)
    description = db.Column(String(255))
    active = db.Column(SmallInteger(), default=1)
    user = db.relationship("User", secondary="roles_users",)


class User(CommonModel):
    __tablename__ = 'user'
    # Authentication Attributes.
    user_name = db.Column(String(255), nullable=False, index=True)
    full_name = db.Column(String(255), nullable=True)
    email = db.Column(String(255), nullable=False, index=True)
    phone_number = db.Column(String(255), nullable=False, index=True)
    password = db.Column(String(255), nullable=False)
    salt = db.Column(String(255), nullable=False)

    is_active = db.Column(Boolean, default=True)
    employee = db.relationship("Employee")
    employee_uid = db.Column(UUID(as_uuid=True), ForeignKey('employee.id', onupdate='CASCADE', ondelete='SET NULL'), index=True, nullable=True)
    roles = db.relationship("Role",
                            secondary="roles_users",
                            )
    def __repr__(self):
        """ Show user object info. """
        return '<User: {}>'.format(self.id)

class TasksEmployees(CommonModel):
    __tablename__ = 'tasks_employees'
    task_uid = db.Column(UUID(as_uuid=True), ForeignKey('tasks.id',onupdate='cascade',ondelete='cascade'), primary_key=True)
    task = db.relationship("Tasks")
    employee_uid = db.Column(UUID(as_uuid=True), ForeignKey('employee.id',onupdate='cascade',ondelete='cascade'), primary_key=True)
    employee = db.relationship("Employee")
   
    
# tasks_employees = db.Table(
#     "tasks_employees",
#     db.Column("task_uid", UUID(as_uuid=True), db.ForeignKey("tasks.id", ondelete="cascade"), primary_key=True),
#     db.Column("employee_uid", UUID(as_uuid=True), db.ForeignKey("employee.id", ondelete="cascade"), primary_key=True)
# )


class Employee(CommonModel):
    __tablename__= 'employee'
    full_name = db.Column(String(255))
    full_name_unsigned = db.Column(String(255))
    avatar_url = db.Column(String)
    email = db.Column(String(255), index=True, unique=True)
    birthday = db.Column(BigInteger())
    phone_number = db.Column(String(32), nullable=False)
    id_identifier = db.Column(String(32), index=True, unique=True)
    attachment_files = db.Column(JSONB())
    address = db.Column(String)
    gender = db.Column(SmallInteger(), default=1)
    position = db.Column(String(32))
    workstations = db.relationship("Workstation", secondary="employee_workstation")
    status = db.Column(String)
    employee_type = db.Column(String)
    start_time = db.Column(BigInteger(), index= True)
    end_time = db.Column(BigInteger(), index=True)
    user = db.relationship("User", cascade="all, delete-orphan", lazy='dynamic')
  


class Tasks(CommonModel):
    __tablename__='tasks'
    task_code = db.Column(String(32), index=True, unique=True, nullable=False)
    task_name = db.Column(String(255), nullable=False)
    task_name_unsigned = db.Column(String(255), nullable=True) # tên không dấu phục vụ truy vấn dữ liệu lớn
#     sub_task = db.Column(Boolean, default=False) # Nếu là subtask thì bắt buộc phải có parent mới cho lưu vào
    parent_code = db.Column(String(255), nullable = True)
    employees = db.relationship("Employee",
                            secondary="tasks_employees")
#     employee = db.relationship("Employee")
#     employee_uid = db.Column(UUID(as_uuid=True), ForeignKey('employee.id', onupdate='CASCADE', ondelete='SET NULL'), index=True, nullable=True)
#     reporter = db.Column(String, ForeignKey('employee.id',ondelete="cascade"), nullable=False)
    tags = db.Column(JSONB())
    priority = db.Column(SmallInteger, index=True) # {1: highest, 2: high, 3: low, 4: lowest}
    attach_file = db.Column(String(255))
    link_issue = db.Column(String(255))
    original_estimate = db.Column(Integer, index=True) # minute unit 
    start_time = db.Column(BigInteger())
    end_time = db.Column(BigInteger())
    status = db.Column(SmallInteger, index=True, default=0) # {0: todo, "2: processing ", "1: done"}
    rating = db.Column(SmallInteger)
    comments = db.Column(JSONB())
    description = db.Column(String(255))
    day_of_week = db.Column(BigInteger()) # +=2^n
    hour_of_day = db.Column(BigInteger()) # +=2^n
    active = db.Column(SmallInteger, default=1)
    

class TaskschedulesTasks(CommonModel):
    __tablename__ = 'taskschedules_tasks'
    task_uid = db.Column(UUID(as_uuid=True), ForeignKey('tasks.id',onupdate='cascade',ondelete='cascade'), primary_key=True)
    task = db.relationship("Tasks")
    task_schedule_uid = db.Column(UUID(as_uuid=True), ForeignKey('task_schedule.id',onupdate='cascade',ondelete='cascade'), primary_key=True)
    task_schedule = db.relationship("TaskSchedule")
    
    
# taskschedules_tasks = db.Table(
#     "taskschedules_tasks",
#     db.Column("task_uid", UUID(as_uuid=True), db.ForeignKey("tasks.id", ondelete="cascade"), primary_key=True),
#     db.Column("task_schedule_uid", UUID(as_uuid=True), db.ForeignKey("task_schedule.id", ondelete="cascade"), primary_key=True)
# )
         
   
class TaskSchedule(CommonModel):
    __tablename__ = 'task_schedule'
    day_of_week = db.Column(BigInteger()) # 2^n
    hour_of_day = db.Column(BigInteger()) #2^n
    start_time_working = db.Column(BigInteger(), default = 0) #equal 0 because 0*2^n =0
    end_time_working = db.Column(BigInteger(),default = 0) #equal 0 because 0*2^n =0
    Tasks = db.relationship("Tasks",
                            secondary="taskschedules_tasks",
                            )

# 0:0 job ngay mai co vievj
# class TodoInfo(CommonModel):
#     __tablename__ = 'todoinfo'
#     code = db.Column(String(255))
#     name = db.Column(String)
#     unsigned_name = db.Column(String)
#     description = db.Column(String)
# 
# 
# class Todo(CommonModel):
#     __tablename__ = 'todo'
#     code = db.Column(String(255))
#     todo_info_id = db.Column(String, ForeignKey("todoinfo.id"), nullable=True)
#     todo_info = db.relationship("TodoInfo")
#     name = db.Column(String)
#     unsigned_name = db.Column(String)
#     short_description = db.Column(String)
#     content = db.Column(String)
#     attachments = db.Column(JSONB())
#     priority = db.Column(SmallInteger, index=True)
#     assigners = db.relationship("TodoDetail",
#                             secondary="todo_tododetail")                     
#     comments = db.Column(JSONB())
#     status = db.Column(SmallInteger)
# 
# 
# class TodoCategory(CommonModel):
#     __tablename__ = 'todo_category'
#     name = db.Column(String)
#     unsigned_name = db.Column(String)
#     description = db.Column(String)
#     priority = db.Column(SmallInteger)


# class TodoSchedule(CommonModel):
#     __tablename__ = 'todoschedule'
#     start_time_working = db.Column(BigInteger())
#     end_time_working = db.Column(BigInteger())
#     todoinfo_id = db.Column(String,ForeignKey('todoinfo.id',ondelete="cascade"), nullable=True)
#     todoinfo = db.relationship("TodoInfo")



#   
# todo_tododetail = db.Table(
#     "todo_tododetail",
#     db.Column("todo_id", String, db.ForeignKey("todo.id", ondelete="cascade"), primary_key=True),
#     db.Column("tododetail_id", String, db.ForeignKey("todo_detail.id", ondelete="cascade"), primary_key=True)
# )

# class TodoDetail(CommonModel):
#     __tablename__ = 'todo_detail'
#     start_time_working = db.Column(BigInteger())
#     end_time_working = db.Column(BigInteger())
#     todo_schedule_id = db.Column(String,ForeignKey('todoschedule.id',ondelete="cascade"))
#     day_working = db.Column(String())
#     time_working = db.Column(String())
#     employee_id = db.Column(String, ForeignKey('employee.id',ondelete="cascade"), nullable=False)
#     employee_name = db.Column(String)
#     employee = db.relationship("Employee")
#     employee_assign_name = db.Column(String) 
#     employee_assign_id = db.Column(String)
#     employee_assign = db.Column(JSONB())
#     todo_id = db.Column(String, ForeignKey('todo.id',ondelete="cascade"), nullable=True)
#     todo_name = db.Column(String)
#     todo = db.relationship("Todo")
#     status_complete_manager = db.Column(SmallInteger,default=0)
#     status_complete_employee = db.Column(SmallInteger,default=0)

#cham cong
class TimeSheet(CommonModel):
    __tablename__ = 'timesheet'
    employee = db.relationship("Employee")
    employee_uid = db.Column(UUID(as_uuid=True), ForeignKey('employee.id', onupdate='CASCADE', ondelete='SET NULL'), index=True, nullable=False)
    start_time_working = db.Column(BigInteger())
    end_time_working = db.Column(BigInteger())
    year = db.Column(Integer)
    month = db.Column(Integer)
    day = db.Column(Integer)
    hour  = db.Column(Integer)
    minute  = db.Column(Integer)
    
organization_workstation = db.Table(
    "organization_workstation",
    db.Column("organization_id", UUID(as_uuid=True), db.ForeignKey("organization.id", ondelete="cascade")),
    db.Column("workstation_id", UUID(as_uuid=True), db.ForeignKey("workstation.id", ondelete="cascade"))
)
 
employee_workstation = db.Table(
    "employee_workstation",
    db.Column("employee_id", UUID(as_uuid=True), db.ForeignKey("employee.id", ondelete="cascade")),
    db.Column("workstation_id", UUID(as_uuid=True), db.ForeignKey("workstation.id", ondelete="cascade"))
)

class Workstation(CommonModel):
    __tablename__ = 'workstation'
    name = db.Column(String)
    organization = db.relationship("Organization")
    organization_uid = db.Column(UUID(as_uuid=True), ForeignKey('organization.id', onupdate='CASCADE', ondelete='SET NULL'), index=True, nullable=False)
    address = db.Column(String(255))


class Organization(CommonModel):
    __tablename__ = 'organization'
    status = db.Column(String(255))
    name = db.Column(String)
    code = db.Column(String(255))
    workstations = db.relationship("Workstation",
                            secondary="organization_workstation",)


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