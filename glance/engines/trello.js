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

var post = function(endpoint, accessToken, options, callback){
// POST /1/webhookslink

// Required permissions: read
// Arguments Hide
// description (optional)
// Valid Values: a string with a length from 0 to 16384
// callbackURL (required)
// Valid Values: A valid URL that is reachable with a HEAD request
// idModel (required)
// Valid Values: id of the model that should be hooked
    
    request.post({
        url: 'https://api.trello.com/1/'+endpoint,
        qs: {
            key: process.env.TRELLO_API_KEY,
            token: accessToken
        },
        form: options
    }, callback)
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

exports.addHook = function(req, options, callback){
    post('/webhooks', req.user.trelloAccessToken, options, function(err, response, body){
        callback(err, JSON.parse(body));
    });
};

exports.disableHook = function(hookId){
    //TODO implement
};