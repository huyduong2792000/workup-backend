from sqlalchemy import (
    Column, String, Integer, BigInteger, Date, Boolean, DECIMAL, ForeignKey, Text, SmallInteger,UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, backref
from application.database import db
from application.database.model import CommonModel, default_uuid
from application.components.user.model import User,Role

class FollowerTask(CommonModel):
    __tablename__ = 'followers_tasks'
    user_id = db.Column(UUID(as_uuid=True), ForeignKey('user.id',onupdate='cascade',ondelete='cascade'), primary_key=True)
    task_id = db.Column(UUID(as_uuid=True), ForeignKey('task.id',onupdate='cascade',ondelete='cascade'), primary_key=True)
    # created_at = db.Column(BigInteger(), index=True)
    note = db.Column(Text())


class Task(CommonModel):
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
    group_id = db.Column(UUID(as_uuid=True), ForeignKey("group.id"))

