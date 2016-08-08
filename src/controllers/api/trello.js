'use strict';

const _ = require('lodash');
const async = require('async');
const request = require('request');
const _trello = require('trello');
const trello = new _trello(process.env.TRELLO_API_KEY);

var get = function(endpoint, accessToken, callback){
    request.get({
        url: 'https://api.trello.com/1/'+endpoint,
        qs: {
            key: process.env.TRELLO_API_KEY,
            token: accessToken
        }
    }, callback);
};

exports.get = (req, res, next) => {
    res.json({welcome:'Hello world new controller!'});
};

exports.getBoards = function(req, callback){
    get('/members/'+req.user.trello.id+'/boards', req.user.trello.accessToken, function(err, response, body){
        // TODO cache the boards here?
        callback(err, JSON.parse(body));
    });
};
