from flask import session, request
from flask_socketio import send, emit
import chat_socket
from rooms import Rooms

roomMgmt = Rooms()

def setupSocketIO(socketio):

    @socketio.on('people_list')
    @chat_socket.auth.isAuthenicated
    def peopleList(message):
        emit('people_list_reply', roomMgmt.getPeopleInRoom(room='global'))
