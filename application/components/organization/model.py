from sqlalchemy import (
    Column, String, Integer, BigInteger, Date, Boolean, DECIMAL, ForeignKey, Text, SmallInteger
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, backref
from application.database import db
from application.database.model import CommonModel, default_uuid



# class Organization(CommonModel):
#     __tablename__ = 'organization'
#     status = db.Column(String(255))
#     name = db.Column(String)
#     code = db.Column(String(255))
#     workstations = db.relationship("Workstation",
#                             secondary="organization_workstation",)