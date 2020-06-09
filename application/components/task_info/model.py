from sqlalchemy import (
    Column, String, Integer, BigInteger, Date, Boolean, DECIMAL, ForeignKey, Text, SmallInteger,UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, backref
from application.database import db
from application.database.model import CommonModel, default_uuid
from application.components.user.model import User,Role

class FollowerTaskInfo(CommonModel):
    __tablename__ = 'followers_tasksinfo'
    user_id = db.Column(UUID(as_uuid=True), ForeignKey('user.id',onupdate='cascade',ondelete='cascade'), primary_key=True)
    task_id = db.Column(UUID(as_uuid=True), ForeignKey('task_info.id',onupdate='cascade',ondelete='cascade'), primary_key=True)
    # created_at = db.Column(BigInteger(), index=True)
    note = db.Column(Text())

class TaskInfo(CommonModel):
    __tablename__ = 'task_info'
    task_info_name = db.Column(String(255))
    checklist_id = db.Column(UUID(as_uuid=True), ForeignKey("checklist.id"), nullable=False)
    group_id = db.Column(UUID(as_uuid=True), ForeignKey("group.id"))
    group = db.relationship('Group')
    unsigned_name = db.Column(String, index=True)
    description = db.Column(String)
    tags = db.Column(JSONB())
    active = db.Column(SmallInteger, default=1)
    assignee_id = db.Column(UUID(as_uuid=True), ForeignKey("user.id"))
    assignee = db.relationship("User")
    followers = db.relationship("User",secondary="followers_tasksinfo")
    attach_file = db.Column(String(255))
    link_issue = db.Column(String(255))
    original_estimate = db.Column(Integer)