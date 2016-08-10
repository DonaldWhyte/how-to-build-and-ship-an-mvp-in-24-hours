var express = require('express');
var router = express.Router();
var Channel = require('../models/Channel');
var availableTypes = ['trello'];

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('channels', { title: 'My random project' });
});


router.get('/add-channel/:type/:externalId', function(req, res, next){
    switch (req.params.type){
        case 'trello':
            // TODO validate external ID - i.e. does this actually exist with the type specified
            // register callbacks
            var channel = new Channel();

            channel.user = req.user;
            channel.project = req.params.id;
            channel.type = req.params.type;
            channel.externalId = req.params.externalId;

            channel.save(function(err, doc){
                if (err){
                    return next(err);
                } else {
                    res.redirect('/projects/'+req.params.id);
                }
            });
        break;
        default:
            return next(new Error('Invalid channel type'));
    }
});

module.exports = router;
