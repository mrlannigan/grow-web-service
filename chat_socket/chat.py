import auth
import re
import urllib
import safygiphy
from flask import session, request
from flask_socketio import send, emit, join_room, leave_room
from datetime import datetime
from uuid import uuid4
from people import roomMgmt
from history import History


class ChatCmds():
    quickCheck = re.compile(pattern='^\/(.+)')
    giphyObj = safygiphy.Giphy()

    def __init__(self):
        self.cmds = self.compile()

    def compile(self):
        chatCmds = [{
            'regex': re.compile(pattern='^\/search (.+)$'),
            'func': 'search'
        }, {
            'regex': re.compile(pattern='^\/join (.+)$'),
            'func': 'joinRoom'
        }, {
            'regex': re.compile(pattern='^\/leave ?(.+)?$'),
            'func': 'leaveRoom'
        }, {
            'regex': re.compile(pattern='^\/giphy (.+)$'),
            'func': 'giphy'
        }]

        return chatCmds

    def process(self, data):
        ret = {'send': True}

        message = data.get('message', '')

        if not self.quickCheck.search(message):
            return ret

        for check in self.cmds:
            match = check['regex'].search(message)
            if match:
                print 'CHATCMD: Running {} command'.format(check['func'])
                ret = self[check['func']](match, data)
                print 'CHATCMD: Ran {} command with the following result:{}'.format(check['func'], ret)
                break

        return ret

    def __getitem__(self, name):
        return getattr(self, name)

    def search(self, match, data):
        ret = {'send': False}

        ret['data'] = {
            'cmd': 'historySearch',
            'uri': '/api/v1/history/search/{}/{}'.format(urllib.quote(data['room']), urllib.quote(match.group(1)))
        }

        return ret

    def joinRoom(self, match, data):
        ret = {'send': False}

        ret['data'] = {
            'cmd': 'joinRoom',
            'room': match.group(1)
        }

        return ret

    def leaveRoom(self, match, data):
        ret = {'send': False}

        ret['data'] = {
            'cmd': 'leaveRoom'
        }

        if match.group(1):
            ret['data']['room'] = match.group(1)
        else:
            ret['data']['room'] = data['room']

        if ret['data']['room'] == 'Global':
            ret['data']['room'] = None
            ret['data']['error'] = 'Can\'t leave the global room.'

        return ret

    def search(self, match, data):
        ret = {'send': False}

        ret['data'] = {
            'cmd': 'historySearch',
            'uri': '/api/v1/history/search/{}/{}'.format(urllib.quote(data['room']), urllib.quote(match.group(1)))
        }

        return ret

    def giphy(self, match, data):
        ret = {'send': True}

        try:
            gif = self.giphyObj.random(tag=match.group(1))

            ret['data'] = {
                'message': '',
                'html': '<img src="{}" width="{}" height="{}" class="giphy-embed"/>'.format(gif['data']['image_url'], gif['data']['image_width'], gif['data']['image_height'])
            }
        except Exception as e:
            print e
            ret['send'] = False
            ret['data'] = {
                'cmd': 'notification',
                'message': 'Unable to get a gif'
            }

        return ret

def setupSocketIO(socketio):

    hs = History()
    cmds = ChatCmds()

    print repr(cmds)

    @socketio.on('chat_send')
    @auth.isAuthenicated
    def receiveChatMessage(data):
        if not 'room' in data:
            emit('chat_error', 'Missing room name')
            return

        if not 'message' in data:
            emit('chat_error', 'Missing the message')
            return

        roomName = data.get('room')
        user = session.get('user')
        message = {
            'message': data.get('message'),
            'room': roomName,
            'name': user.get('name'),
            'email': user.get('email'),
            'picture': user.get('picture', '/static/img/VegetaItsOver9000-02.png'),
            'message_id': str(uuid4()),
            'timestamp': datetime.now().isoformat()
        }

        control = cmds.process(message)

        if control.get('send', True):
            if control.has_key('data'):
                message.update(control['data'])

            hs.writeMessageToRoom(**message)
            emit('chat_recv', message, room=roomName)
        else:
            emit('chat_cmd', control.get('data', False))


    @socketio.on('room_join')
    @auth.isAuthenicated
    def joinRoom(roomName):
        join_room(roomName)
        email = session['user'].get('email')
        name = session['user'].get('name')
        picture = session['user'].get('picture')

        roomMgmt.addPersonToRoom(name, email, picture, roomName)

        emit('room_join', {
            'room': roomName,
            'user': {
                'email': email,
                'name': name,
                'picture': picture
            }
        }, room=roomName)

    @socketio.on('room_leave')
    @auth.isAuthenicated
    def leaveRoom(roomName):
        leave_room(roomName)

        email = session['user'].get('email')

        roomMgmt.removePersonFromRoom(email, roomName)
        emit('room_leave', {
            'room': roomName,
            'user': {
                'email': email,
                'name': session['user'].get('name'),
                'picture': session['user'].get('picture')
            }
        }, room=roomName)
