from redis import Redis
from pool import pool
from json import dumps, loads

class Rooms(object):
    roomHash = {}

    def __init__(self):
        super(Rooms, self).__init__()
        self.redis = Redis(connection_pool=pool)

    def getPeopleInRoom(self, room):
        ret = []
        for room, people in self.roomHash.iteritems():
            for person in people.itervalues():
                ret.append({
                    'name': person.get('name'),
                    'email': person.get('email')
                })

        return ret

    def addPersonToRoom(self, name, email, picture, room):
        self.addRoomToHash(room)

        if not email in self.roomHash[room]:
            self.roomHash[room][email] = {
                'name': name,
                'email': email,
                'picture': picture
            }

        self.redis.hset(name=room, key=email, value=dumps(self.roomHash[room][email]))

    def removePersonFromRoom(self, email, room):
        if not room in self.roomHash:
            self.roomHash[room] = {}
            return

        if email in self.roomHash[room]:
            del self.roomHash[room][email]

        self.redis.hdel(room, email)

    def removePersonFromAllRooms(self, email):
        for room, people in self.roomHash.iteritems():
            if email in people:
                self.removePersonFromRoom(email=email, room=room)

    def sync(self):
        extRoomList = self.redis.lrange(name='rooms', start=0, end=-1)
        extRoomHash = {}

        for room in extRoomList:
            self.addRoomToHash(room)

            roomPeople = self.redis.hgetall(name=room)

            for email, rawData in roomPeople.iteritems():
                if not email in self.roomHash[room]:
                    self.roomHash[room][email] = loads(rawData)

    def addRoomToHash(self, room):
        if not room in self.roomHash:
            self.roomHash[room] = {}
