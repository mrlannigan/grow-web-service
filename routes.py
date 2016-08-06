from flask import render_template, jsonify, request, Response
from app import app
from chatlocation import ChatLocation
import requests
from history import History

@app.route('/')
@app.route('/index.html')
def index():
    return render_template('index.html')


@app.route('/api/v1/chat-service')
def chatLocation():
    resp = jsonify({ 'url': ChatLocation(request.url).build() });
    return resp

@app.route('/api/v1/auth', methods=['POST'])
def createAuthentication():
    try:
        req = requests.request('POST', 'http://auth:5000/v1/auth', data=request.data, headers={
            'Content-Type': 'application/json'
        })
        return Response(response=req.text, status=req.status_code, content_type=req.headers['content-type'])
    except Exception as e:
        return repr(e)

@app.route('/api/v1/history/<room>')
def getRoomHistory(room):
    hs = History()

    search = hs.getRoomMessages(room=room)

    return jsonify(search)

@app.route('/api/v1/history/search/<room>/<term>')
def getSearchRoomHistory(room, term):
    hs = History()

    search = hs.searchRoomMessages(room=room, term=term)

    return jsonify(search)
