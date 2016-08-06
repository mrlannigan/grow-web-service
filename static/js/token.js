var tokenMgmt = {
  getRemoteAccessToken: function (id_token) {

    return makePOST({
      url: '/api/v1/auth',
      data: {
        google_id_token: id_token
      }
    }).then(function (xhr) {
      if (xhr.json && xhr.json.access_token) {
        tokenMgmt.setLocalAccessToken(xhr.json.access_token);
      }

      userMgmt.setInfo(xhr.json);

    }).catch(function (e) {
      // maybe show an error to the user
      console.log('error getting access_token');
    })
  },

  getLocalAccessToken: function () {
    return sessionStorage.getItem('access_token');
  },

  clearLocalAccessToken: function () {
    return sessionStorage.removeItem('access_token');
  },

  setLocalAccessToken: function (token) {
    return sessionStorage.setItem('access_token', token);
  }
};
