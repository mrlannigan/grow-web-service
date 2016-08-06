from elasticsearch import Elasticsearch

es = Elasticsearch(['elasticsearch'], maxsize=25)

class History(object):
    """docstring for History."""
    def __init__(self):
        super(History, self).__init__()

    def writeMessageToRoom(self, message_id, message, room, name, email, picture, timestamp, **kwargs):
        msg = {
            'message_id': message_id,
            'message': message,
            'room': room,
            'name': name,
            'email': email,
            'picture': picture,
            'timestamp': timestamp
        }

        res = es.index(index='messages', doc_type=msg['room'], id=msg['message_id'], body=msg);

    def getRoomMessages(self, room, date=None, count=50):
        query = {
            'sort': {
                'timestamp': 'desc'
            },
            'size': count
        }

        if date:
            query['query'] = {
                'range': {
                    'timestamp': {
                        'gte': '2000',
                        'lte': date.strftime('%y-%m-%d %H:%M:%S'),
                        'format': 'yyyy||yyyy-MM-dd HH:mm:ss'
                    }
                }
            }
        else:
            query['query'] = {
                'match_all': {}
            }

        res = es.search(index='messages', doc_type=room, body=query)

        return self.extractMessages(res)

    def searchRoomMessages(self, room, term, count=50):
        query = {
            'sort': {
                'timestamp': 'desc'
            },
            'size': count
        }

        query['query'] = {
            'simple_query_string': {
                'query': term,
                'fields': ['message']
            }
        }

        res = es.search(index='messages', doc_type=room, body=query)

        return self.extractMessages(res)

    def extractMessages(self, els):
        res = []

        for doc in els['hits']['hits']:
            res.append(doc.get('_source'))

        return res
