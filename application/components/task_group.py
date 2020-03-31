from application.extensions import apimanager
from application.models.model import *
from gatco.exceptions import ServerError
from application.components import auth_func
from application.extensions import auth
from gatco.response import text, json

import re
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

def create_task_group(request=None, data=None, Model=None):
    uid = auth.current_user(request)
    if uid is not None:
        data['created_by'] = uid
        data['unsigned_name'] = no_accent_vietnamese(data['name'])
        data['supervisor_uid'] = data['supervisor']['id']
        # db.session.add(result)
        # db.session.commit()

    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)

def add_group_to_employee(request=None, result=None, Model=None, headers=None):
    employee = db.session.query(Employee).filter(Employee.id == result['supervisor']['id']).first()
    group = db.session.query(TaskGroup).filter(TaskGroup.id == result['id']).first()

    task_groups = list(employee.task_groups)
    task_groups.append(group)
    employee.task_groups = task_groups.copy()
    db.session.add(employee)
    db.session.commit()
    return

def remove_group_from_employee(data):
    if data['supervisor']['id'] != data['supervisor_uid']:
        employee_old = db.session.query(Employee).filter(Employee.id == data['supervisor_uid']).first()
        task_groups_employee_old = list(employee_old.task_groups)
        print("old=======",task_groups_employee_old)
        for task_group in task_groups_employee_old:
            if str(task_group.id) == str(data['id']):
                task_groups_employee_old.remove(task_group)
        employee_old.task_groups = task_groups_employee_old
        db.session.commit()


def update_task_group(request=None, data=None, **kw):
    print(data)
    uid = auth.current_user(request)
    if uid is not None:
        data['created_by'] = uid
        data['unsigned_name'] = no_accent_vietnamese(data['name'])
        data['supervisor_uid'] = data['supervisor']['id']
        if(data['deleted'] is False):
           remove_group_from_employee(data)

    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)


def filter_task_group(request=None, search_params=None, **kwargs):
    uid = auth.current_user(request)
    if uid is not None:
        if 'filters' in search_params:
            filters = search_params["filters"]
            if "$and" in filters:
                # search_params["filters"]['$and'].append({"active":{"$eq": 1}})
                search_params["filters"]['$and'].append({"deleted":{"$eq": False}})
                search_params["filters"]['$and'].append({"created_by":{"$eq": uid}})
            else:
                search_params["filters"]['$and'] = [{"created_by":{"$eq": uid}}, {"deleted":{"$eq": False} } ]
        else:
            search_params["filters"] = {'$and':[{"created_by":{"$eq": uid}},{"deleted":{"$eq": False}}]}
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)   
        
apimanager.create_api(collection_name='task_group', model=TaskGroup,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func,filter_task_group], POST=[auth_func,create_task_group], PUT_SINGLE=[auth_func,update_task_group], DELETE_SINGLE=[auth_func]),
    postprocess=dict(POST=[auth_func,add_group_to_employee], PUT_SINGLE=[add_group_to_employee], DELETE_SINGLE=[], GET_MANY =[]),
    )