var makePOST = function (options) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();

    attachXHRStateChange(xhr, resolve, reject);

    xhr.open('POST', options.url, true);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.setRequestHeader('cache-control', 'no-cache');
    xhr.send(JSON.stringify(options.data));
  });
};

var makeGET = function (options) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();

    attachXHRStateChange(xhr, resolve, reject);

    xhr.open('GET', options.url, true);
    xhr.setRequestHeader('cache-control', 'no-cache');
    xhr.send();
  });
};

var attachXHRStateChange = function (xhr, resolve, reject) {
  xhr.addEventListener('readystatechange', function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {

      if (xhr.responseText) {
        try {
          xhr.json = JSON.parse(xhr.responseText);
        } catch (e) {
          xhr.json = null;
        }
      }

      if (xhr.status === 200) {
        resolve(xhr);
      } else {
        reject(xhr);
      }
    }
  });
}
