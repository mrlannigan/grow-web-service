var roomMgmt = {
  joinRoom: function (roomName) {
    console.log('joinRoom', roomName);
    chat.emit('room_join', roomName);
  },

  leaveRoom: function (roomName) {
    console.log('leaveRoom', roomName);
    chat.emit('room_leave', roomName);
  },

  activeRoom: null,

  uiAddRoom: function (roomName, noActive) {

    if (!roomName) {
      return;
    }

    if (roomMgmt.uiRoomExists(roomName)) {
      closeModal();
      if (!noActive) {
        roomMgmt.setActiveRoom(roomName);
      }
      return Promise.resolve();
    }

    var roomEls = document.querySelectorAll('.current_rooms_list_item');

    [].forEach.call(roomEls, function(element) {
      element.className = 'current_rooms_list_item';
    });

    // First room added
    if (roomEls.length < 2) {
      noActive = false;
    }

    var newRoom = document.createElement('li');
    newRoom.className = 'current_rooms_list_item';
    newRoom.innerHTML = roomName;
    newRoom.setAttribute('data-roomname', roomName);
    newRoom.addEventListener('click', roomMgmt.uiRoomClick)

    document.getElementById('create_new_room').insertAdjacentElement('beforebegin', newRoom);

    return chat.getRoomHistory(roomName, noActive);
  },

  uiRoomExists: function (roomName) {

    var list = [];

    [].forEach.call(document.querySelectorAll('.current_rooms_list_item'), function(element) {
      if (element.getAttribute('data-roomname') === roomName) {
        list.push(element);
      }
    });

    return !!list.length;
  },

  uiRoomClick: function () {
    roomMgmt.setActiveRoom(this.innerHTML);
  },

  setActiveRoom: function (roomName) {
    var selector = document.querySelectorAll('.current_rooms_list_item'),
      win = roomMgmt.uiGetMessageList();

    [].forEach.call(selector, function(element) {
      element.className = 'current_rooms_list_item';
      if (element.getAttribute('data-roomname') === roomName) {
        element.className += ' active';
      }
    });

    if (roomMgmt.activeRoom === roomName) {
      return Promise.resolve();
    }

    roomMgmt.activeRoom = roomName;

    [].forEach.call(win.querySelectorAll('.messages_list_item'), function (msgItem) {
      win.removeChild(msgItem);
    });

    if (chat.log.hasOwnProperty(roomName) && chat.log[roomName].length) {
      chat.log[roomName].forEach(function (data) {
        var li = roomMgmt.createDOMForMessage(data);

        win.insertAdjacentElement('beforeend', li);
      });

      roomMgmt.scrollChatWindowToBottom();
    }

    return Promise.resolve();
  },

  handleNewMessage: function (room, data) {
    if (room !== roomMgmt.activeRoom) {
      return;
    }

    var li = roomMgmt.createDOMForMessage(data),
      isAtBottom = roomMgmt.isChatWindowScrolledToBottom();

    roomMgmt.uiGetMessageList()
      .insertAdjacentElement('beforeend', li);

    if (isAtBottom) {
      roomMgmt.scrollChatWindowToBottom();
    }
  },

  createDOMForMessage: function (data) {

    var li = document.createElement('li'),
      avatar = document.createElement('div'),
      message = document.createElement('div'),
      user = document.createElement('div');

    // user
    user.className = 'user';
    user.innerHTML = data.name + ' at ' + moment(data.timestamp).format('MMM D LTS');

    // message
    message.className = 'message';
    message.innerText = data.message;

    // avatar
    avatar.className = 'avatar';
    avatar.style.backgroundImage = 'url("' + data.picture + '?sz=46")'

    // li
    li.className = 'messages_list_item';
    li.setAttribute('data-user', data.name.replace(' ', '_'));
    li.setAttribute('data-messageid', data.message_id || 'noidgiven');
    li.setAttribute('data-room', data.room);
    li.setAttribute('data-timestamp', data.timestamp);

    li.appendChild(avatar);
    li.appendChild(message);
    li.appendChild(user);

    return li;
  },

  uiGetMessageList: function () {
    return document.getElementById('chat_room').querySelector('.messages_list');
  },

  isChatWindowScrolledToBottom: function () {
    var win = roomMgmt.uiGetMessageList();

    return win.scrollHeight - win.clientHeight <= win.scrollTop + 1;
  },

  scrollChatWindowToBottom: function () {
    var win = roomMgmt.uiGetMessageList();

    win.scrollTop = win.scrollHeight;
  },

  createRoomFromModal: function() {
    var modalInput = document.getElementById('create_room_form').querySelector('input'),
      roomName = modalInput.value;

    roomMgmt.createRoom(roomName);
    closeModal();

    modalInput.value = '';
  },

  createRoom: function(roomName, noActive) {
    roomMgmt.joinRoom(roomName);
    roomMgmt.uiAddRoom(roomName, noActive);
  }
};
