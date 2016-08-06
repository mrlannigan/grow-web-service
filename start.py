from app import app, socketio
from errors import registerAPIErrors
from flask import session, request
from flask_socketio import send, emit

registerAPIErrors(app)

import routes

if __name__ == "__main__":
    # repr(app.url_map)
    socketio.run(app, host='0.0.0.0', debug=False)
