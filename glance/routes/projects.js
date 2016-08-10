var express = require('express');
var router = express.Router();
var Project = require('../models/Project');
var Trello = require('../engines/trello');

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

router.post('/add', function(req, res, next) {
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

router.get('/:id', function(req, res, next) {
  Project.findOne({ user: req.user.id, _id: req.params.id }, function(err, doc){
    if (err){
      req.flash('errors', err);
    } else {
      res.render('channels', {
        title: doc.name + ' | Project',
        user: req.user,
        project: doc,
        errors: err
      });
    }
  });
});

module.exports = router;
