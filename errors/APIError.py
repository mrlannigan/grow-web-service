class APIError(Exception):
    status_code = 500
    error_message = 'Internal Server Error'

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['statusCode'] = self.status_code
        rv['error'] = self.error_message
        rv['message'] = self.message
        return rv
