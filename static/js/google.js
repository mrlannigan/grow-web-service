var googleLoaded = function googleLoaded() {
  if (googleLoadedTimeout) {
    clearTimeout(googleLoadedTimeout);
  }

  gapi.signin2.render('login_button', {
    'scope': 'profile email',
    'width': 240,
    'height': 50,
    'longtitle': true,
    'theme': 'dark',
    'onsuccess': login,
    'onfailure': console.error
  });

  console.log('googleLoaded');
};

var googleLoadedTimeout = null;

// apparently, google's lib callback doesn't always fire...
// setting this timeout to make sure it does
document.addEventListener('DOMContentLoaded', function(event) {
  googleLoadedTimeout = setTimeout(function () {
    googleLoadedTimeout = null;
    console.log('fired from timeout, because reasons');
    googleLoaded();
  }, 500);
});
