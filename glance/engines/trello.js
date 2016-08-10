var request = require('request');

var get = function(endpoint, accessToken, callback){
    request.get({
        url: 'https://api.trello.com/1/'+endpoint,
        qs: {
            key: process.env.TRELLO_API_KEY,
            token: accessToken
        }
    }, callback);
};

exports.getBoards = function(req, callback){
    get('/members/'+req.user.trelloId+'/boards', req.user.trelloAccessToken, function(err, response, body){
        // TODO cache the boards here?
        callback(err, JSON.parse(body));
    });
};