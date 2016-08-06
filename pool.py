import redis

pool = redis.ConnectionPool(host='chat_redis', port=6379, db=0, max_connections=20)
