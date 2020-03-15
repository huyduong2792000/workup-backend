# Register Blueprints/Views.
from gatco.response import text, json
from application.extensions import jinja, auth


def init_views(app):
    import application.controllers.user
    import application.controllers.apimanger
    import application.controllers.todoschedule
    import application.controllers.tasks
    
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
 