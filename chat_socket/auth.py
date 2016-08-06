import requests
from flask import session, request
from flask_socketio import emit
from functools import wraps

def setupSocketIO(socketio):

    @socketio.on('auth_submit')
    def authSubmit(token):
        if not token:
            emit('auth_error', {'error': 'Missing auth token'})
            return

        verify = verifyToken(token)

        if verify == False:
            emit('auth_error', {'error': 'Invalid token'})
            return

        session['authenticated'] = True
        session['user'] = verify
        emit('auth_good', {'sid': request.sid, 'session': verify})


def verifyToken(token):
    try:
        req = requests.request('GET', 'http://auth:5000/v1/auth/token/{}'.format(token))

        theJson = req.json()
        if 'statusCode' in theJson and theJson.statusCode >= 400:
            return False

        return req.json()
    except Exception as e:
        print repr(e)
        return False


def isAuthenicated(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session['authenticated']:
            return f(*args, **kwargs)
        else:
            emit('auth_error_silent', {'error': 'Not authenticated'})
            return
    return decorated_function
