from flask import Flask
from socketio import RedisManager, KombuManager
from flask_socketio import SocketIO
from chat_socket import setupSocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

socketio = SocketIO(app, logger=True, engineio_logger=True)
# , client_manager=RedisManager(url='redis://chat_redis:6379/0', channel='socketio', write_only=False)

setupSocketIO(socketio)
