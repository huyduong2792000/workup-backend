from application.extensions import apimanager
from application.models.model import *
from gatco.exceptions import ServerError
from application.components import auth_func
from application.extensions import auth
from gatco.response import text, json
from application.components.user.model import User, Role
# from application.components.group.model import Group,GroupsUsers
from application.components.checklist.model import Checklist,Shift
from application.components.task_info.model import TaskInfo
from application.components.group.model import Group

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


@app.route('/api/v1/checklist', methods=["POST"])
def createChecklist(request=None, data=None, Model=None):
    uid = auth.current_user(request)
    if uid is not None:
        checklist = request.json
        response = checklist
        checklist['unsigned_name'] = no_accent_vietnamese(checklist['checklist_name'])
        checklist['created_by'] = uid
        
        new_checklist = Checklist()
        for key in checklist.keys():
                if hasattr(new_checklist,key) and key not in ["shifts","tasks_info"]:
                    setattr(new_checklist, key, checklist[key])

        db.session.add(new_checklist)
        new_checklist.shifts = []
        for shift in checklist['shifts']:
            new_shift = Shift()
            for key in shift.keys():
                if hasattr(new_shift,key):
                    setattr(new_shift, key, shift[key])
            new_checklist.shifts.append(new_shift)
            db.session.add(new_shift)
        
        
        new_checklist.tasks_info = []
        for task_info in checklist['tasks_info']:
            new_task_info = TaskInfo()
            for key in task_info.keys():
                if hasattr(new_task_info,key) and key not in ["assignee","group"]:
                    setattr(new_task_info,key,task_info[key])
            new_checklist.tasks_info.append(new_task_info)
            db.session.add(new_task_info)
        db.session.commit()
        # print(new_checklist.__dict__)
        db.session.flush()
        return json(response,status=201)

    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)


@app.route('/api/v1/checklist/<checklist_id>', methods=["GET"])
def createChecklist(request=None, checklist_id = None):
    uid = auth.current_user(request)
    if uid is not None:
        # checklist = request.json
        checklist = db.session.query(Checklist).filter(Checklist.id == checklist_id).first()
        tasks_info = checklist.tasks_info
        checklist = to_dict(checklist)
        checklist['tasks_info'] = []
        for task_info in tasks_info:
            new_task_info = {}
            new_task_info = to_dict(task_info)
            new_task_info['group'] = to_dict(task_info.group)
            checklist['tasks_info'].append(new_task_info)
        return json(checklist,status=200)

    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)


