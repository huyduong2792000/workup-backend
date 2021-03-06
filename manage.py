""" Module for managing tasks through a simple cli interface. """
# Libraries

import sys
from os.path import abspath, dirname
sys.path.insert(0, dirname(abspath(__file__)))
import random
import string
import sqlalchemy
from sqlalchemy.inspection import inspect
import json

from manager import Manager

from application import run_app
from application.database import db

from application.extensions import auth
from application.components.user.model import User, Role
from application.components.group.model import Group,GroupsUsers

import math

from application.components.task_schedule.api import runSchedule
from threading import Thread


# Constants.
manager = Manager()


@manager.command
def run():
    # Thread(target = runSchedule).start()
    """ Starts server on port 8000. """
    run_app(host="0.0.0.0", port=8678)
    
@manager.command
def generate_schema(path = "static/schema", exclude = None, prettyprint = True):
    """ Generate javascript schema"""
    exclude_list = None
    if path is None:
        print("Path is required")
        return
    
    if exclude is not None:
        exclude_list = exclude.split(",")
        
    for cls in [cls for cls in db.Model._decl_class_registry.values() if isinstance(cls, type) and issubclass(cls, db.Model)]:
        classname = cls.__name__
        if (exclude_list is not None) and (classname in exclude_list):
            continue
        schema = {}
        for col in cls.__table__.c:
            col_type = str(col.type)
            schema_type = ''
            if 'DECIMAL' in col_type:
                schema_type = 'number'
            if col_type in ['INTEGER','SMALLINT', 'FLOAT' ]:
                schema_type = 'number'
            if col_type == 'DATETIME':
                schema_type = 'datetime'
            if col_type == 'DATE':
                schema_type = 'datetime'
            if 'VARCHAR' in col_type:
                schema_type = 'string'
            if col_type in ['VARCHAR', 'UUID', 'TEXT']:
                schema_type = 'string'
            if col_type in ['JSON', 'JSONB']:
                schema_type = 'json'
            if 'BOOLEAN' in col_type:
                schema_type = 'boolean'
            
            schema[col.name] = {"type": schema_type}
            
            if col.primary_key:
                schema[col.name]["primary"] = True
            #nullabel
            if (not col.nullable) and (not col.primary_key):
                schema[col.name]["required"] = True
                
            if hasattr(col.type, "length") and (col.type.length is not None):
                schema[col.name]["length"] = col.type.length
            
            #default
            if (col.default is not None) and (col.default.arg is not None) \
                and (not callable(col.default.arg)) and not isinstance(col.default.arg, sqlalchemy.sql.functions.GenericFunction):
                #print(col.default, col.default.arg, callable(col.default.arg))
                schema[col.name]["default"] = col.default.arg
                
            #User confirm_password
            if (classname == "User") and ("password" in col.name):
                schema["confirm_password"] = {"type": schema_type}
                schema["confirm_password"]["length"] = col.type.length
                
                
        
        relations = inspect(cls).relationships
        for rel in relations:
            if rel.direction.name in ['MANYTOMANY', 'ONETOMANY']:
                schema[rel.key] = {"type": "list"}
            if rel.direction.name in ['MANYTOONE']:
                schema[rel.key] = {"type": "dict"}
        
        if prettyprint:
            with open(path + '/' + classname + 'Schema.json', 'w') as outfile:
                json.dump(schema,  outfile, indent=4,)
        else:
            with open(path + '/' + classname + 'Schema.json', 'w') as outfile:
                json.dump(schema,  outfile,)


@manager.command
def update_admin(password='123456'):
    user = User.query.filter(User.email == "admin@gmail.com").first()


    if user is not None:
        
        # create user password
        user_password=auth.encrypt_password(password, user.salt)
        user.password = user_password
        db.session.commit()
        
@manager.command
def create_admin(password='123456'):
    """ Create default data. """

    role_admin = Role.query.filter(Role.role_name == "admin").first()
    if(role_admin is None):
        role_admin = Role(role_name='admin', display_name="Admin")
        db.session.add(role_admin)
        db.session.flush()
    
    role_user = Role.query.filter(Role.role_name == "user").first()
    if(role_user is None):
        role_user = Role(role_name='user', display_name="User")
        db.session.add(role_user)
        db.session.flush()

    role_employee = Role.query.filter(Role.role_name == "employee").first()
    if(role_employee is None):
        role_employee = Role(role_name='employee', display_name="Employee")
        db.session.add(role_employee)
        db.session.flush()

    role_leader = Role.query.filter(Role.role_name == "leader").first()
    if(role_leader is None):
        role_leader = Role(role_name='leader', display_name="Leader")
        db.session.add(role_leader)
        db.session.flush()

    role_member = Role.query.filter(Role.role_name == "member").first()
    if(role_member is None):
        role_member = Role(role_name='member', display_name="member")
        db.session.add(role_member)
        db.session.flush()
    user = User.query.filter(User.email == "admin@gmail.com").first()
    # employee = Employee(full_name="Admin User", email="admin@gonrin.com",phone_number="0968244158",\
    #             id_identifier=123456)
    # user.employee = employee
    # user.roles = [role_admin]
    # db.session.add(user)
    db.session.commit()
    if user is None:
        # create salt
        letters = string.ascii_lowercase
        user_salt = ''.join(random.choice(letters) for i in range(64))
        print("user_salt", user_salt)
        # create user password
        user_password=auth.encrypt_password(password, user_salt)

        #create user
        # employee = Employee(full_name="Admin User", email="admin@gonrin.com",phone_number="0968244158",\
        #         id_identifier=123456)
        user = User(display_name="Admin User", email="admin@gmail.com",\
            password=user_password, salt=user_salt, phone="0333333333")
        db.session.add(user)
        db.session.flush()
        new_group = Group(
            group_name="group Admin User",
            unsigned_name="group Admin User" ,
            assignee_id = user.id,
            # members=[user]
        )
        db.session.add(new_group)
        db.session.flush()
        new_relation = GroupsUsers(
            user_id = user.id,
            group_id = new_group.id,
            role_id = role_admin.id
        )
        db.session.add(new_relation)
    db.session.commit()

    return

if __name__ == '__main__':
    manager.main()