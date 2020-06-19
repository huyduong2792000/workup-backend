from sqlalchemy import (
    Column, String, Integer, BigInteger, Date, Boolean, DECIMAL, ForeignKey, Text, SmallInteger,UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, backref
from application.database import db
from application.database.model import CommonModel, default_uuid
# from application.components.user.model import User,Role


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
    parent_id = db.Column(UUID(as_uuid=True), ForeignKey("group.id"),default=None)
    assignee_id = db.Column(UUID(as_uuid=True), ForeignKey("user.id"))
    assignee = db.relationship("User", foreign_keys=[assignee_id])
    members = db.relationship("User",secondary="groups_users")
    checklists = db.relationship("Checklist",secondary="checklists_groups")
    tasks_info = db.relationship('TaskInfo')
