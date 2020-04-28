from sqlalchemy import (
    Column, String, Integer, BigInteger, Date, Boolean, DECIMAL, ForeignKey, Text, SmallInteger,UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, backref
from application.database import db
from application.database.model import CommonModel, default_uuid
from application.components.user.model import User,Role
from application.components.group.model import Group

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
