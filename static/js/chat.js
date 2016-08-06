var chat = {
  connection: null,

  log: {},

  debug: function () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('chat_module');
    console.log.apply(console, args);
  },

  cmds: {
    historySearch: function (data) {
      makeGET({
        url: data.uri
      }).then(function (xhr) {
        historyMgmt.showChatHistorySearch(xhr.json);
      })
    },
    joinRoom: function (data) {
      roomMgmt.createRoom(data.room);
    },
    leaveRoom: function (data) {
      if (!data.room && data.error) {
        var msg = {};

        msg.message = data.error;
        msg.room = roomMgmt.activeRoom;

        return roomMgmt.handleNewMessage(msg.room, msg);
      }
      roomMgmt.uiLeaveRoom(data.room);
    }
  },

  createConnection: function () {
    var conn = io('ws://' + location.host);
    chat.connection = conn;

    // Auth
    conn.on('auth_ack', chat.sendAuth.bind(chat));
    conn.on('auth_good', chat.handleGoodAuth.bind(chat));
    conn.on('auth_error', chat.handleAuthError.bind(chat));

    // Chatters
    conn.on('people_connect', chattersMgmt.handleConnectMessage);
    conn.on('people_disconnect', chattersMgmt.handledisconnectMessage);

    // Kick off chatter list reoccurring update
    chattersMgmt.updateConnectedList();

    conn.on('chat_recv', chat.handleChatRecv.bind(chat));
    conn.on('chat_cmd', chat.handleChatCmd.bind(chat));

    conn.on('room_join', chat.handleRoomJoin.bind(chat));
    conn.on('room_leave', chat.handleRoomLeave.bind(chat));

    return Promise.resolve();
  },

  sendAuth: function () {
    var token = tokenMgmt.getLocalAccessToken();

    chat.emit('auth_submit', token);
  },

  handleAuthError: function (data) {
    chat.debug('authError', data);
    tokenMgmt.clearLocalAccessToken();
    setTimeout(function () {
      location.reload();
    }, 500);
  },

  handleGoodAuth: function () {
    chat.debug('good auth');

    setTimeout(function () {
      roomMgmt.createRoom('Global', true);
      chattersMgmt.requestConnectedUsers();
    }, 200);
  },

  emit: function () {
    chat.connection.emit.apply(chat.connection, arguments);
  },

  once: function () {
    chat.connection.once.apply(chat.connection, arguments);
  },

  handleChatRecv: function (data) {
    var room = data.room;

    if (chat.log.hasOwnProperty(room) === false) {
      chat.log[room] = [];
    }

    if (data.hasOwnProperty('timestamp')) {
      data.timestamp = new Date(data.timestamp);
    }

    if (!(data.hasOwnProperty('persist') && data.persist === false)) {
      chat.log[room].push(data);
    }
    roomMgmt.handleNewMessage(room, data);
  },

  handleChatCmd: function (data) {
    if (chat.cmds.hasOwnProperty(data.cmd)) {
      chat.cmds[data.cmd].call(chat, data);
    }
  },

  handleRoomJoin: function (data) {
    var msg = {};

    msg.message = data.user.name + ' joined the room';
    msg.room = data.room

    roomMgmt.handleNewMessage(data.room, msg);
  },

  handleRoomLeave: function (data) {
    var msg = {};

    msg.message = data.name + ' left the room';
    msg.room = data.room

    roomMgmt.handleNewMessage(data.room, msg);
  },

  sendChatMessage: function (message) {
    if (!message) {
      return;
    }

    chat.emit('chat_send', {message: message, room: roomMgmt.activeRoom});
  },

  getRoomHistory: function (roomName, noActive) {
    makeGET({
      url: '/api/v1/history/' + encodeURIComponent(roomName)
    }).then(function (xhr) {
      var msgs,
        cacheIds = [];

      msgs = xhr.json.map(function (msg) {
        if (msg.hasOwnProperty('timestamp')) {
          msg.timestamp = new Date(msg.timestamp);
        }

        return msg;
      });

      if (chat.log.hasOwnProperty(roomName) === false) {
        chat.log[roomName] = [];
      }

      chat.log[roomName].unshift.apply(chat.log[roomName], msgs);

      chat.log[roomName].sort(chat.messageSort);

      chat.log[roomName] = chat.log[roomName].filter(function (msg) {
        if (cacheIds.indexOf(msg.message_id) === -1) {
          cacheIds.push(msg.message_id);
          return true;
        } else {
          return false;
        }
      });

      if (!noActive) {
        roomMgmt.activeRoom = null;
        return roomMgmt.setActiveRoom(roomName);
      }
    });
  },

  messageSort: function (a, b) {
    return a.timestamp > b.timestamp ? 1 : a.timestamp < b.timestamp ? -1 : 0;
  }
}
