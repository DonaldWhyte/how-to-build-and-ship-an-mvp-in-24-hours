var request = require('request');

var get = function(endpoint, accessToken, options, callback){
    if (!!options === false){
        options = {};
    }

    options.key = process.env.TRELLO_API_KEY;
    options.token = accessToken;

    request.get({
        url: 'https://api.trello.com/1/'+endpoint,
        qs: options
    }, callback);
};

exports.getBoards = function(req, callback){
    get('/members/'+req.user.trelloId+'/boards', req.user.trelloAccessToken, null, function(err, response, body){
        // TODO cache the boards here?
        callback(err, JSON.parse(body));
    });
};

exports.getBoard = function(req, boardId, options, callback){
    get('/boards/'+boardId, req.user.trelloAccessToken, options, function(err, response, body){
        callback(err, JSON.parse(body));
    });
}; 

exports.disableHook = function(hookId){
    //TODO implement
};