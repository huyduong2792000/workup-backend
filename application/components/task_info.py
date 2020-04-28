from application.extensions import apimanager
from application.models.model import *
from application.server import app
from gatco.exceptions import ServerError
from application.components.user import *
from application.components.salary import *
from application.components import auth_func
from application.extensions import auth
from gatco.response import text, json
from gatco_restapi.helpers import to_dict

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

def create_taskinfo(request=None, data=None, **kw):
    uid = auth.current_user(request)
    if uid is not None:
        data['created_by'] = uid
        data['unsigned_name'] = no_accent_vietnamese(data['task_name'])
        data['task_group_uid'] = data['task_group']['id']
    else:
        return json({
            "error_code": "USER_NOT_FOUND",
            "error_message":"USER_NOT_FOUND"
        }, status = 520)
    
def filter_taskinfo(request=None, search_params=None, **kwargs):
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
        
apimanager.create_api(collection_name='task_info', model=TaskInfo,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func,filter_taskinfo], POST=[auth_func,create_taskinfo], PUT_SINGLE=[auth_func,create_taskinfo], DELETE_SINGLE=[auth_func]),
    postprocess=dict(POST=[], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[]),
    )

@app.route('/api/v1/task_info_with_supervisor', methods=["GET", "OPTIONS"])
def task_info_with_supervisor(request):
    id_task_info = request.args.get("id", None)
    task_info = db.session.query(TaskInfo).filter(TaskInfo.id == id_task_info).first()
    result=to_dict(task_info)
    task_group = to_dict(task_info.task_group)
    result['task_group'] = task_group
    supervisor = to_dict(task_info.task_group.supervisor)
    result['task_group']['supervisor'] = supervisor

    return json(result)

@app.route('/api/v1/task_info_delete_multiple',methods=['PUT'])
async def delete_multiple(request):
    param = request.json
    # print(param)
    list_id_select = [data['id'] for data in param['data_delete']]
    tasks_info = db.session.query(TaskInfo).filter(TaskInfo.id.in_(list_id_select)).all()
    for task_info in tasks_info:
        task_info.deleted = True
        db.session.add(task_info)
    db.session.commit()
    return json({
            "message": "DELETE_SUCCESS",
            }, status = 200)

@app.route('/api/v1/task_many_time', methods=["GET", "OPTIONS"])		
def filter_employee(request):		
    tasks_info = db.session.query(TaskInfo).all()		
    data_resp = []		
    for task in tasks_info:	
        task = task.__dict__	
        obj = {"id": str(task['id']),	
               "task_code": task['task_code'],	
               "task_name": task['task_name']	
              }	
        data_resp.append(obj)
    return json(data_resp)