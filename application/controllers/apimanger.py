from application.extensions import apimanager
from application.models.model import *
from gatco.exceptions import ServerError
from application.controllers.todoschedule import *
from application.controllers.user import *
from application.controllers.salary import *
from application.controllers import auth_func

apimanager.create_api(collection_name='timesheet', model=TimeSheet,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func], PUT_SINGLE=[auth_func]),
    postprocess=dict(POST=[], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[]),
    )
# 
# apimanager.create_api(collection_name='todo_category', model=TodoCategory,
#     methods=['GET', 'POST', 'DELETE', 'PUT'],
#     url_prefix='/api/v1',
#     preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func], POST=[auth_func], PUT_SINGLE=[auth_func]),
#     )

# apimanager.create_api(collection_name='todoinfo', model=TodoInfo,
#     methods=['GET', 'POST', 'DELETE', 'PUT'],
#     url_prefix='/api/v1',
#     preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func], POST=[auth_func], PUT_SINGLE=[auth_func]),
#     )
# apimanager.create_api(collection_name='todoschedule', model=TodoSchedule,
#     methods=['GET', 'POST', 'DELETE', 'PUT'],
#     url_prefix='/api/v1',
#     preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func], POST=[auth_func], PUT_SINGLE=[auth_func]),
#     postprocess=dict(POST=[pre_post_todo_schedule], PUT_SINGLE=[pre_put_todo_schedule], DELETE_SINGLE=[], GET_MANY =[]),
# 
#     )
# apimanager.create_api(collection_name='todoscheduledetail', model=TodoScheduleDetail,
#     methods=['GET', 'POST', 'DELETE', 'PUT'],
#     url_prefix='/api/v1',
#     preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func],POST=[auth_func], PUT_SINGLE=[auth_func] ),
#     )
# apimanager.create_api(collection_name='todo_detail', model=TodoDetail,
#     methods=['GET', 'POST', 'DELETE', 'PUT'],
#     url_prefix='/api/v1',
#     preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func], POST=[auth_func], PUT_SINGLE=[auth_func]),
#     )
# apimanager.create_api(collection_name='workstation', model=Workstation,
#     methods=['GET', 'POST', 'DELETE', 'PUT'],
#     url_prefix='/api/v1',
#     preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func], POST=[auth_func], PUT_SINGLE=[auth_func]),
#     )
# apimanager.create_api(collection_name='organization', model=Organization,
#     methods=['GET', 'POST', 'DELETE', 'PUT'],
#     url_prefix='/api/v1',
#     preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func], POST=[auth_func], PUT_SINGLE=[auth_func]),
#     )