from APIError import APIError
from BadRequest import BadRequest
from Unauthorized import Unauthorized
from flask import jsonify

def registerAPIErrors(app):
    @app.errorhandler(APIError)
    @app.errorhandler(Unauthorized)
    @app.errorhandler(BadRequest)
    def handle_api_error(error):
        return jsonify(error.to_dict())
