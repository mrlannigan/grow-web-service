from flask import render_template, jsonify, request
from app import app
from chatlocation import ChatLocation

@app.route('/')
@app.route('/index.html')
def index():
    return render_template('index.html')


@app.route('/api/v1/chat-service')
def chatLocation():
    resp = jsonify({ 'url': ChatLocation(request.url).build() });
    return resp
