from urlparse import urlparse, urlunparse

class ChatLocation():
    """Determines connection string for chat service for client"""

    def __init__(self, url):
        self.url = url

    def build(self):
        parsed = urlparse(self.url)
        return urlunparse(('ws', parsed.netloc, '', '', '', ''))
