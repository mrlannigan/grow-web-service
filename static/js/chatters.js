var chattersMgmt = {
  users: [],

  updateConnectedList: function () {
    return chattersMgmt
      .requestConnectedUsers()
      .delay(60000)
      .then(function () {
        return chattersMgmt.updateConnectedList();
      })
      .catch(function (err) {
        console.log('error: updateConnectedList', err.message);
        return Promise.delay(15000).then(function () {
          chattersMgmt.updateConnectedList();
        });
      });
  },

  requestConnectedUsers: function () {
    // send message to chat service to return array of usernames and ids
    return new Promise(function (resolve, reject) {

      chat.once('people_list_reply', function (list) {
        resolve(list);
      });

      chat.emit('people_list', {});
    })
    .timeout(1000, 'Timeout Reached when retrieving chatters')
    .tap(function (list) {
      chattersMgmt.users = list;
      chattersMgmt.userLastUpdate = Date.now();
      chattersMgmt.redraw();
    });
  },

  handleDisconnectMessage: function (chatter) {
    // handles disconnect of another user, updates our list and display
    chattersMgmt.users = chattersMgmt.users.filter(function (user) {
      return user.email !== chatter.email;
    });
    chattersMgmt.redraw();
  },

  handleConnectMessage: function (chatter) {
    // handles connection of another user, updates our list and display
    chattersMgmt.users.push(chatter);
    chattersMgmt.redraw();
  },

  redraw: function () {
    var userIds,
      userListEl = document.querySelector('#chat_room .user_list'),
      alreadyDisplayedIds = [];

    userIds = chattersMgmt.users.map(function (user) {
      return user.email;
    });

    // removes any li that isn't in the current list
    // track any that already do
    [].forEach.call(userListEl.querySelectorAll('li'), function(el, index) {
      if (!el.hasAttribute('data-id')) {
        return el.remove();
      }

      var id = el.getAttribute('data-id')
      if (userIds.indexOf(id) === -1 || alreadyDisplayedIds.indexOf(id) !== -1) {
        return el.remove();
      }

      alreadyDisplayedIds.push(id);
    });

    // add any that are missing to the bottom
    chattersMgmt.users
      .filter(function (user) {
        return alreadyDisplayedIds.indexOf(user.email) === -1;
      })
      .forEach(function (user) {
        var el = document.createElement('li');
        el.className = 'user_list_item';
        el.setAttribute('data-id', user.email);
        el.innerHTML = user.name;

        userListEl.appendChild(el);
      })
  }
};
