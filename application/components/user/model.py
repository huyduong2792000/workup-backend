from sqlalchemy import (
    Column, String, Integer, BigInteger, Date, Boolean, DECIMAL, ForeignKey, Text, SmallInteger
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, backref
from application.database import db
from application.database.model import CommonModel, default_uuid


roles_users = db.Table('roles_users',
                       db.Column('user_uid', UUID(as_uuid=True),
                                 db.ForeignKey('user.id')),
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
    employee_uid = db.Column(UUID(as_uuid=True), ForeignKey(
        'employee.id', onupdate='CASCADE', ondelete='SET NULL'), index=True, nullable=True)
    roles = db.relationship("Role", secondary="roles_users",)

    def __repr__(self):
        """ Show user object info. """
        return '<User: {}>'.format(self.id)
