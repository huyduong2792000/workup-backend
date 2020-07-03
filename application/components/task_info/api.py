from application.extensions import apimanager
from application.models.model import *
from gatco.exceptions import ServerError
from application.components import auth_func
from application.extensions import auth
from gatco.response import text, json
from application.components.user.model import User, Role
# from application.components.group.model import Group,GroupsUsers
from application.components.checklist.model import Checklist,Shift,ChecklistGroup
from application.components.task_info.model import TaskInfo,FollowerTaskInfo
from application.components.group.model import Group,GroupsUsers
from application.components.user.model import User, Role

from application.server import app
from datetime import datetime
from sqlalchemy import and_, or_,func,literal
import re
import json as to_json
from gatco_restapi.helpers import to_dict

def no_accent_vietnamese(s):
    s = re.sub(r'[àáạảãâầấậẩẫăằắặẳẵ]', 'a', s)
    s = re.sub(r'[ÀÁẠẢÃĂẰẮẶẲẴÂẦẤẬẨẪ]', 'A', s)
    s = re.sub(r'[èéẹẻẽêềếệểễ]', 'e', s)
    s = re.sub(r'[ÈÉẸẺẼÊỀẾỆỂỄ]', 'E', s)
    s = re.sub(r'[òóọỏõôồốộổỗơờớợởỡ]', 'o', s)
    s = re.sub(r'[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]', 'O', s)
    s = re.sub(r'[ìíịỉĩ]', 'i', s)
    s = re.sub(r'[ÌÍỊỈĨ]', 'I', s)
    s = re.sub(r'[ùúụủũưừứựửữ]', 'u', s)
    s = re.sub(r'[ƯỪỨỰỬỮÙÚỤỦŨ]', 'U', s)
    s = re.sub(r'[ỳýỵỷỹ]', 'y', s)
    s = re.sub(r'[ỲÝỴỶỸ]', 'Y', s)
    s = re.sub(r'[Đ]', 'D', s)
    s = re.sub(r'[đ]', 'd', s)
    return s


@app.route('/api/v1/taskinfo', methods=["POST"])
def postTaskInfo(request=None, data=None, Model=None):
    uid = auth.current_user(request)
    if uid is not None:
        task_info = request.json
        task_info = createTaskInfo(task_info,uid)
        response = to_dict(task_info)
        response['group'] = to_dict(task_info.group)
        print(response['group'])
        return json(response,status=201)

    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)

def createTaskInfo(task_info,uid):
    # print(task_info['group'])
    task_info['unsigned_name'] = no_accent_vietnamese(task_info['task_info_name'])
    task_info['created_by'] = uid
    assignee = task_info.get('assignee',{})
    group = task_info.get('group',{})
    checklist = task_info.get('checklist',{})
    
    new_task_info = TaskInfo()
    for key in task_info.keys():
            if hasattr(new_task_info,key) and not isinstance(task_info[key], (dict, list )):
                setattr(new_task_info, key, task_info[key])

    #set ssignee
    setattr(new_task_info, "assignee_id", assignee.get('id',None))
    #set group
    # print('sdfddddddddd',isinstance(getattr(new_group,"check_lists"), (float, int, str, )))
    if group.get("id",None) is not  None:
        setattr(new_task_info, "group_id", group.get("id",None))
        # CHECK EXISTS
        # print('CHECK EXISTS')
        # role_id = db.session.query(Role.id).filter(Role.role_name == "member").first()
        # print(role_id)
        check_member = db.session.query(GroupsUsers).filter(GroupsUsers.user_id == assignee.get('id'),\
                GroupsUsers.group_id == group.get("id")).first()
        if check_member is None:
            new_relation_member = GroupsUsers(
                group_id = group.get('id'),
                user_id = assignee.get('id'),
                role_id = db.session.query(Role.id).filter(Role.role_name == "member").first()
            )
            db.session.add(new_relation_member)

    elif group.get('id',None) is None and group.get('group_name') is not None and group.get('group_name') != '':
        new_group = Group()
        for key in group.keys():
            if hasattr(new_group,key) and not isinstance(group[key], (dict, list )):
                setattr(new_group, key, group[key])

        assignee = db.session.query(User).filter(User.id == assignee.get('id',None)).first()
        setattr(new_group, "assignee_id", assignee.id)

        # parent_id = db.session.query(Group.id).join(ChecklistGroup).filter(
        #     ChecklistGroup.checklist_id == task_info.get('checklist_id',None),
        #     Group.parent_id == None
        # ).first()
        # setattr(new_group, "parent_id", parent_id)
        db.session.add(new_group)
        db.session.flush()
        setattr(new_task_info, "group_id", new_group.id)
        # setattr(new_task_info, "group", new_group)
        #set admin for new_group
        new_relation = GroupsUsers(
            group_id = new_group.id,
            user_id = assignee.id,
            role_id = db.session.query(Role.id).filter(Role.role_name == "admin").first()
        )
        db.session.add(new_relation)
        db.session.flush()
        # db.session.add(new_task_info)
        # db.session.flush()
    else:
        pass
    db.session.add(new_task_info)
    db.session.flush()

    #set followers
    for follower in task_info.get('followers',[]):
        new_follower_task_info = FollowerTaskInfo()
        new_follower_task_info.user_id = follower.get('id',None)
        new_follower_task_info.task_info_id = new_task_info.id
        new_follower_task_info.note = task_info.get('Note',None)
        db.session.add(new_follower_task_info)
    db.session.commit()

    # print(new_task_info.__dict__)
    return new_task_info

def validUserUpdate(user):
    result = {}
    for key in user.keys():
        if hasattr(User,key) and not isinstance(user[key], (dict, list )):
            result[key] = user[key]
    return result
def putProcess(request=None, instance_id=None, data=None, Model=None):
    followers = []
    for follower in data.get('followers',[]):
        followers.append(validUserUpdate(follower))
    data['followers'] = followers
    data['assignee'] = validUserUpdate(data['assignee'])

    data['unsigned_name'] = no_accent_vietnamese(data['task_info_name'])


apimanager.create_api(collection_name='task_info', model=TaskInfo,
    methods=['GET', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func], PUT_SINGLE=[auth_func,putProcess], DELETE_SINGLE=[auth_func]),
    )

