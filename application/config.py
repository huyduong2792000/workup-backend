class Config(object):
    DEBUG = True
    STATIC_URL = "static"
    SQLALCHEMY_DATABASE_URI = 'postgresql://uptaskuser:6789-8866-6868@localhost:5432/uptaskmanager'
    AUTH_LOGIN_ENDPOINT = 'login'
    AUTH_PASSWORD_HASH = 'sha512_crypt'
    AUTH_PASSWORD_SALT = 'ruewhndjsa17heaw'
    SECRET_KEY = 'e2q8dhaushdauwd7qye'
    SESSION_COOKIE_SALT = 'dhuasud819wubadhysagd'
    TIME_CRON_JOB = "00:00"
    AUTH_EXPIRE_TIME = 864000