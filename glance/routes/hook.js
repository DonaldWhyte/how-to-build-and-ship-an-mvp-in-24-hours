var express = require('express');
var router = express.Router();

var Channel = require('../models/Channel');
var Hook = require('../models/Hook');
var Project = require('../models/Project');
var User = require('../models/User');

var Trello = require('../engines/trello');

router.post('/:id', function(req, res, next) {
    Hook.findOne({ _id: req.params.id})
        .exec(function(err, doc){
            if (err) return next(err);

            doc.meta = req.body;
            doc.save(function(err, savedDoc){
                if (err) return next(err);

                res.json({success:true});
            }); 
        }); 
});

module.exports = router;
