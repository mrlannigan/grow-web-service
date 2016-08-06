from APIError import APIError

class Unauthorized(APIError, Exception):
    status_code = 401
    error_message = 'Unauthorized'

    def __init__(self, *args, **kwargs):
        APIError.__init__(self, *args, **kwargs)
