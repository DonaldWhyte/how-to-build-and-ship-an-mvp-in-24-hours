'use strict';

const _ = require('lodash');
const async = require('async');
const request = require('request');
const _trello = require('trello');
const trello = new _trello(process.env.TRELLO_API_KEY);

exports.get = (req, res, next) => {
    res.json({welcome:'Hello world new controller!'});
};

exports.engine = trello;