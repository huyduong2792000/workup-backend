# Register Blueprints/Views.
from gatco.response import text, json
from application.extensions import jinja, auth



def init_views(app):
    import application.components.user.api
    import application.components.organization.api

    import application.components.user
    import application.components.apimanger
    import application.components.task_schedule
    import application.components.tasks
    import application.components.task_info
    import application.components.task_group


    @app.route('/')
    def index(request):
        #return text("Index")
        return jinja.render('index.html', request)


def auth_func(request=None, **kw):
    pass
    uid = auth.current_user(request)
    if uid is not None:
        pass
    else:
        json({"error": "current user not found"})
