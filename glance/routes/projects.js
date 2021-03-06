var express = require('express');
var router = express.Router();
var Project = require('../models/Project');
var Trello = require('../engines/trello');
var Channel = require('../models/Channel');

var Hook = require('../models/Hook');

router.get('/', function(req, res, next) {
  // must be logged in
  if (!req.user) {
    return res.redirect('/');
  }

  Project.find({user:req.user.id}, function(err, docs){
      res.render('projects', {
        title: 'Projects',
        user: req.user,
        projects: docs,
        errors: err
      });
  });
});

router.post('/', function(req, res, next) {
  req.assert('name', 'Project name cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors){
    req.flash('errors', errors);
    return res.redirect('/projects');
  }

  var project = new Project({name: req.body.name, user: req.user});

  project.save(function(err, proj){
    if (err){
      req.flash('errors', err);
    } else {
      return res.redirect('/projects');
    }
  });
});

var findProject = function(userId, projectId, callback) {
       Project.findOne({ user: userId, _id: projectId }).populate('channels').exec(callback);
};

// TODO check if this external id hasn't already been added to this project
router.get('/:id/add/:type/:externalId', function(req, res, next){
    findProject(req.user.id, req.params.id, function(err, doc){
        if (err){
            return next(err);
        } 

            switch (req.params.type){
                case 'trello':
                    Trello.getBoard(req, req.params.externalId, {lists:'all',list_fields:'name'}, function(err, board){
                        if (err){
                            return next(err);
                        } 
                        // TODO better error handling
                        var channel = new Channel();

                        channel.user = req.user;
                        channel.project = req.params.id;
                        channel.type = req.params.type;
                        channel.externalId = req.params.externalId;
                        channel.name = board.name;
                        channel.project = doc.id;
                        channel.meta = board;

                        channel.save(function(err, channelDoc){
                            if (err){
                                return next(err);
                            } else {
                                doc.channels.push(channelDoc.id);
 
                                var hook = new Hook();
                                hook.endpoint = 'http://dev.glance.today/hook/'+hook._id;
                                hook.user = req.user.id;
                                hook.project = doc.id;
                                hook.channel = channelDoc.id
                                hook.save(function(err, savedHook){
                                    if (err) return next(err);

                                    Trello.addHook(req, {
                                        description: "My hook",
                                        callbackURL: savedHook.endpoint,
                                        idModel: channelDoc.id
                                    }, function(err, response){
                                        if (err) return next(err);

                                        savedHook.initMeta = response;

                                        savedHook.save();

                                        doc.save(function(err){
                                            // TODO better error checking
                                             res.redirect('/projects/'+req.params.id);
                                        });    
                                    });
                                });
                       
                            }
                        });
                    });
                break;
                default:
                    return next(new Error('Invalid channel type'));
            }
    });
});

router.get('/:id/monitor/:channelId/:listId', function(req, res, next){
    Channel.findOne({project:req.params.id, user:req.user.id, _id:req.params.channelId}).exec(function(err, currentChannel){
        if (err){
            return next(err);
        } 

        switch(currentChannel.type){
            case 'trello':
                // find enabled hook and disable it
                // enable the hook on the current list

                var hookedListId = false;
                for (var i=0, j = currentChannel.meta.lists.length; i < j; i++){
                    try {
                        if (currentChannel.meta.lists[i].hook.enabled === true){
                            currentChannel.meta.lists[i].hook.enabled = false;
                            // TODO maybe easier to just hook to teh board?
                            // Trello.disableHook(currentChannel.meta.lists[i].hook.id);
                        }
                    }catch(e){}    

                    if (currentChannel.meta.lists[i].id == req.params.listId){
                        currentChannel.meta.lists[i].hook = {};
                        currentChannel.meta.lists[i].hook.enabled = true;
                        currentChannel.meta.lists[i].hook.id = "123456";
                        // Trello.hookBoard?
                        currentChannel.monitoringId = req.params.listId;
                    }                
                }

                currentChannel.markModified('meta');

                // get the board from trello
                Trello.getBoard(req, currentChannel.externalId, {lists:'all',list_fields:'name',cards:'all',card_fields:'idList'}, function(err, board){
                    if (err) return next(err);

                    currentChannel.total = board.cards.length;
                    currentChannel.completed = board.cards.filter(function(card){ return card.idList == currentChannel.monitoringId; }).length;

                    currentChannel.markModified('total');
                    currentChannel.markModified('completed');

                    currentChannel.save(function(err, currChannelDoc){
                        if (err){
                            return next(err);
                        }
                        res.redirect('/projects/'+req.params.id);
                    });
                });


            break;
            default:
                return next(new Error("Invalid channel"));
        }
    });
});

router.get('/:id', function(req, res, next) {
    // should probably make this check better
    findProject(req.user.id, req.params.id, function(err, doc){
        if (err){
          // req.flash('errors', err);
          return next(err);
        } else if(doc == null){
            return next(new Error("No project found"));
        } else {
            // hacky 
            if (req.user.trelloId){
                Trello.getBoards(req, function(err, boards){
                    if (err){ return next(err); }
                    var externalChannelIds = doc.channels.map(function(channel){ return channel.externalId; });
                    boards = boards.filter(function(board){ return externalChannelIds.indexOf(board.id) == -1; });

                    doc.channels = doc.channels.map(function(channel){
                        channel.percentageCompleted = 0;
                        try {
                            channel.percentageCompleted = channel.completed / channel.total;
                            channel.percentageCompleted *= 100;
                        } catch(e){}
                        return channel;
                    });

                    res.render('channels', {
                        title: doc.name + ' | Project',
                        user: req.user,
                        project: doc,
                        errors: err,
                        boards: boards,
                      });
                });
            } else {
                res.render('channels', {
                    title: doc.name + ' | Project',
                    user: req.user,
                    project: doc,
                    errors: err
                  });
            }
        }
      });
});


module.exports = router;
