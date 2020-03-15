import os
from .server import app

def run_app(host="0.0.0.0", port=8678, debug=False):
    """ Function for bootstrapping gatco app. """
    app.run(host=host, port=port, debug=debug, workers=os.cpu_count())