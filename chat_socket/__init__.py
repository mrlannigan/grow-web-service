import auth
import people
import chat
import traceback

from flask import request, session
from flask_socketio import emit, send

def setupSocketIO(socketio):

    auth.setupSocketIO(socketio)
    people.setupSocketIO(socketio)
    chat.setupSocketIO(socketio)

    @socketio.on('connect')
    def onConnect():
        session['authenticated'] = False
        emit('auth_ack')

    @socketio.on('disconnect')
    def onDisconnect():
        if 'user' in session and session['user'].get('email'):
            people.roomMgmt.removePersonFromAllRooms(session['user'].get('email'))

    @socketio.on_error_default  # handles all namespaces without an explicit error handler
    def default_error_handler(e):
        traceback.print_exc(e)
        print e
