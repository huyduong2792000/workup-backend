from application.extensions import apimanager
from application.models.model import *
from gatco.exceptions import ServerError
from application.components.user import *
from application.components.salary import *
from application.components import auth_func

apimanager.create_api(collection_name='timesheet', model=TimeSheet,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func], PUT_SINGLE=[auth_func]),
    postprocess=dict(POST=[], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[]),
    )
