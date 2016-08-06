from APIError import APIError

class BadRequest(APIError):
    status_code = 400
    error_message = 'Bad Request'

    def __init__(self, *args, **kwargs):
        APIError.__init__(self, *args, **kwargs)
