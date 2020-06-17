from application.extensions import apimanager
from application.models.model import *
from gatco.exceptions import ServerError
from application.components import auth_func
from application.extensions import auth
from gatco.response import text, json
from application.components.user.model import User, Role
# from application.components.group.model import Group,GroupsUsers
from application.components.checklist.model import Checklist,Shift,ChecklistGroup,ChecklistShift
from application.components.task_info.model import TaskInfo
from application.components.group.model import Group

from application.server import app
from datetime import datetime
from sqlalchemy import and_, or_,func,literal
import re
import json as to_json
from gatco_restapi.helpers import to_dict
from application.components.task_info.api import createTaskInfo
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
        checklist_request = request.json
        # print(checklist_request)
        response = checklist_request
        checklist_request['unsigned_name'] = no_accent_vietnamese(checklist_request['checklist_name'])
        checklist_request['created_by'] = uid
        groups = checklist_request.get('groups',[])
        new_checklist = Checklist()
        for key in checklist_request.keys():
                if hasattr(new_checklist,key) and not isinstance(checklist_request[key], (dict, list )):
                    setattr(new_checklist, key, checklist_request[key])

        new_checklist.days_worker_week = checklist_request.get('days_worker_week',[])
        new_checklist.days_worker_month = checklist_request.get('days_worker_month',[])

        #set groups
        new_checklist.groups = []
        for group in groups:
            if group.get('id',None) is None:
                new_group = Group()
                for key in group.keys():
                    if hasattr(new_group,key) and not isinstance(group[key], (dict, list )):
                        setattr(new_group, key, group[key])
                db.session.add(new_group)
                db.session.flush()
                new_checklist.groups.append(new_group)
            else:
                group_query = db.session.query(Group).filter(Group.id == group.get('id')).first()
                new_checklist.groups.append(group_query)

        #set shifts
        new_checklist.shifts = []
        for shift in checklist_request['shifts']:
            new_shift = Shift()
            for key in shift.keys():
                if hasattr(new_shift,key) and not isinstance(shift[key], (dict, list )):
                    setattr(new_shift, key, shift[key])
            db.session.flush()
            new_checklist.shifts.append(new_shift)
            db.session.add(new_shift)
        
        db.session.add(new_checklist)
        db.session.flush()

        new_checklist = to_dict(new_checklist)
        db.session.commit()
        return json(new_checklist,status=201)
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)


@app.route('/api/v1/checklist/<checklist_id>', methods=["GET"])
def createChecklist(request=None, checklist_id = None):
    uid = auth.current_user(request)
    # print(createTaskInfo)
    if uid is not None:
        # checklist = request.json
        checklist = db.session.query(Checklist).filter(Checklist.id == checklist_id).first()
        response = to_dict(checklist) or {}
        tasks_info = db.session.query(TaskInfo).join(Group).filter(TaskInfo.checklist_id == checklist.id).order_by(Group.group_name).all()
        response['tasks_info'] = []
        response['groups'] = []
        response['shifts'] = []

        for group in checklist.groups:
            response['groups'].append(to_dict(group))
        for shift in checklist.shifts:
            response['shifts'].append(to_dict(shift))

        for task_info in tasks_info:
            task_info_add = {}
            task_info_add = to_dict(task_info)
            task_info_add['group'] = to_dict(task_info.group)
            task_info_add['assignee'] = to_dict(task_info.assignee)
            response['tasks_info'].append(task_info_add)
        return json(response,status=200)
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)

@app.route('/api/v1/checklist/<checklist_id>', methods=["PUT"])
def putChecklist(request=None, checklist_id = None):
    uid = auth.current_user(request)
    if uid is not None:
        checklist_request = request.json
        # print(checklist_request)
        response = checklist_request
        checklist_request['unsigned_name'] = no_accent_vietnamese(checklist_request['checklist_name'])
        checklist_request['created_by'] = uid
        groups = checklist_request.get('groups',[])
        checklist_update = db.session.query(Checklist).filter(Checklist.id == checklist_request.get('id')).first()
        for key in checklist_request.keys():
                if hasattr(checklist_update,key) and not isinstance(checklist_request[key], (dict, list )):
                    setattr(checklist_update, key, checklist_request[key])

        checklist_update.days_worker_week = checklist_request.get('days_worker_week',[])
        checklist_update.days_worker_month = checklist_request.get('days_worker_month',[])
        checklist_update.groups = []

        #SET SHIFTS
        shifts_in_relation_ids = []
        for shift in checklist_request.get('shifts',[]):
            # CHECK EXISTS
            shift_check = db.session.query(ChecklistShift).filter(ChecklistShift.shift_id == shift.get('id'),\
                ChecklistShift.checklist_id == checklist_request.get('id')).first()
            if shift_check is not None:
                #reset shift exists
                shift_reset = db.session.query(Shift).filter(Shift.id == ChecklistShift.shift_id)
                for key in shift.keys():
                    if hasattr(shift_reset,key) and not isinstance(shift[key], (dict, list )) and key not in ['id']:
                        setattr(shift_reset, key, shift[key])
                shifts_in_relation_ids.append(shift_check.id)
                db.session.add(shift_reset)
            else:
                #create new shift
                new_shift = Shift()
                for key in shift.keys():
                    if hasattr(new_shift,key) and not isinstance(shift[key], (dict, list )):
                        setattr(new_shift, key, shift[key])
                db.session.add(new_shift)
                db.session.flush()

                #add new shift to relationship
                new_relation = ChecklistShift(
                    shift_id = new_shift.id,
                    checklist_id = checklist_request.get('id'),
                    )
                db.session.add(new_relation)
                db.session.flush()
                shifts_in_relation_ids.append(new_relation.id)
                
        # DELETE ALL OTHER RELATIONS NOT IN shifts_in_relation_ids
        db.session.query(ChecklistShift).filter(~ChecklistShift.id.in_(shifts_in_relation_ids),ChecklistShift.checklist_id==checklist_request.get('id')).delete(synchronize_session=False)

        db.session.add(checklist_update)
        db.session.commit()
        return json(to_dict(checklist_update),status=200)
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)
