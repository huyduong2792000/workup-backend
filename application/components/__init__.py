# Register Blueprints/Views.
from gatco.response import text, json
from application.extensions import jinja, auth



def init_views(app):


    import application.components.organization
    import application.components.organization.api
    
    import application.components.task_schedule.api
    import application.components.task_schedule
    
    import application.components.task_info
    import application.components.task_info.api

    # import application.components.apimanger
    
    import application.components.task
    import application.components.task.api

    import application.components.checklist
    import application.components.checklist.api

    import application.components.group
    import application.components.group.api
    
    import application.components.user
    import application.components.user.api
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
