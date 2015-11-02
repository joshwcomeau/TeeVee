// Basic wrapper for HTTP requests.
// Can be called from client or server.
// Not needed to connect to our own server; only used for external requests.

API = {
  http_method: function(method, url) {
    return new Promise( (resolve, reject) => {
      Meteor.http.call(method, url, (err, response) => {
        if (err) return reject(err);
        resolve(response.data);
      });
    });
  },
  
  get: function(url) {
    return this.http_method('GET', url);
  },
  
  post: function(url) {
    return this.http_method('POST', url);
  }
};