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


