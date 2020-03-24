from application.extensions import apimanager
from application.models.model import *
from gatco.exceptions import ServerError
from application.controllers.user import *
from application.controllers.salary import *
from application.controllers import auth_func

def create_taskinfo(request=None, data=None, **kw):
    uid = auth.current_user(request)
    if uid is not None:
        data['created_by'] = uid
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
    preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func,filter_taskinfo], POST=[auth_func,create_taskinfo], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
    postprocess=dict(POST=[], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[]),
    )