const request = require('request');

const baseURL = 'http://gamesbyemail.com/Games/GameMethods.aspx';

exports.handler = function(event, context, callback) {
  request(
    { url: baseURL, qs: event.queryStringParameters },
    (err, response, body) => {
      if (err != null) {
        callback(err);
        return;
      }

      console.log(response);

      callback(null, {
        statusCode: response.statusCode,
        body,
      });
    }
  );
};
