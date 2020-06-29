from sqlalchemy import (
    Column, String, Integer, BigInteger, Date, Boolean, DECIMAL, ForeignKey, Text, SmallInteger
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, backref
from application.database import db
from application.database.model import CommonModel, default_uuid
from application.components.group.model import Group


class Role(CommonModel):
    __tablename__ = 'role'
    role_name = db.Column(String(100), index=True, nullable=False, unique=True)
    display_name = db.Column(String(255), nullable=False)
    description = db.Column(String(255))
    active = db.Column(SmallInteger(), default=1)
    # user = db.relationship("User", secondary="roles_users")


class User(CommonModel):
    __tablename__ = 'user'
    # Authentication Attributes.
    display_name = db.Column(String(255), nullable=False)
    unsigned_display_name = db.Column(String(255))
    email = db.Column(String(255), index=True)
    phone = db.Column(String(255), index=True, unique=True, nullable=False)
    password = db.Column(String(255), nullable=False)
    salt = db.Column(String(255), nullable=False)
    is_active = db.Column(Boolean, default=True)
    id_identifier = db.Column(String(32), index=True)
    gender = db.Column(SmallInteger(), default=1)
    birthday = db.Column(BigInteger())
    address = db.Column(String)
    status = db.Column(String)
    start_time = db.Column(BigInteger(), index= True)
    end_time = db.Column(BigInteger(), index=True)
    group_last_access_id = db.Column(UUID(as_uuid=True), ForeignKey("group.id"))
    group_last_access = db.relationship("Group", foreign_keys=[group_last_access_id])

    def __repr__(self):
        """ Show user object info. """
        return '<User: {}>'.format(self.id)
