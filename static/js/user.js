var userMgmt = {
  userLogout: function userLogout() {
    auth2 = gapi.auth2.getAuthInstance();

    tokenMgmt.clearLocalAccessToken();

    auth2.signOut().then(function () {
      location.reload();
    });

    return false;
  },

  setInfo: function (userInfo) {
    sessionStorage.setItem('user_info', JSON.stringify(userInfo));
  },

  getInfo: function () {
    return JSON.parse(sessionStorage.getItem('user_info'));
  },

  clearInfo: function () {
    sessionStorage.removeItem('user_info');
  }
};
