from gatco.response import json, text
from application.server import app
from application.database import db
from application.extensions import auth
import random
import string
from application.extensions import apimanager
from application.models.model import User, Tasks,Employee
from application.controllers import auth_func
from sqlalchemy import and_, or_
from hashids import Hashids
from math import floor
from datetime import datetime

hashids = Hashids(salt = "make task easy", alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")


def create_task(request=None, data=None, **kw):
#     task_code = "UP"+hashids.encode(floor(datetime.today().timestamp()))
#     data['task_code'] = task_code
#     data['employee_uid'] = data['employee']['id']
    pass
#     return data



apimanager.create_api(
        collection_name='tasks', model=Tasks,
        methods=['GET', 'POST', 'DELETE', 'PUT'],
        url_prefix='/api/v1',
        preprocess=dict(GET_SINGLE=[auth_func], GET_MANY=[auth_func], POST=[auth_func, create_task], PUT_SINGLE=[auth_func], DELETE_SINGLE=[auth_func]),
        postprocess=dict(POST=[], PUT_SINGLE=[], DELETE_SINGLE=[], GET_MANY =[])
    )

