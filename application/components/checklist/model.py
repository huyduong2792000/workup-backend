from sqlalchemy import (
    Column, String, Integer, BigInteger, Date, Boolean, DECIMAL, ForeignKey, Text, SmallInteger,UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, backref
from application.database import db
from application.database.model import CommonModel, default_uuid
from application.components.user.model import User,Role
from application.components.group.model import Group

# from application.components.task_info.model import TaskInfo


class Checklist(CommonModel):
    __tablename__ = "checklist"
    checklist_name = db.Column(String(255),nullable = False)
    unsigned_name = db.Column(String(255),nullable = False)
    note = db.Column(String(255))
    shifts = db.relationship("Shift",secondary="checklists_shifts")
    tasks_info = db.relationship("TaskInfo")
    group_id = db.Column(UUID(as_uuid=True), ForeignKey('group.id',onupdate='cascade',ondelete='cascade'))
    group = db.relationship("Group")

class ChecklistShift(CommonModel):
    __tablename__ = "checklists_shifts"
    shift_id = db.Column(UUID(as_uuid=True), ForeignKey('shift.id',onupdate='cascade',ondelete='cascade'),nullable = False)
    check_list_id = db.Column(UUID(as_uuid=True), ForeignKey('checklist.id',onupdate='cascade',ondelete='cascade'), nullable = False)

class Shift(CommonModel):
    __tablename__ = "shift"
    shift_name = db.Column(String(50))
    start_hour_working = db.Column(String(20), default="00:00")
    end_hour_working = db.Column(String(20), default="23:59")
    check_list = db.relationship("Checklist",secondary="checklists_shifts")


