var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var dotenv = require('dotenv').config();
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var expressSession = require('express-session');
var mongoose = require('mongoose');
var routes = require('./routes/index');
var users = require('./routes/users');
var projects = require('./routes/projects');
var channels = require('./routes/channels');
var TrelloStrategy = require('passport-trello').Strategy;

var app = express();

var User = require('./models/User');

mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});


/** setup passport twitter auth **/

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: '/login/twitter/callback',
  passReqToCallback: true
}, (req, accessToken, tokenSecret, profile, done) => {
  if (req.user) {
    User.findOne({ twitterId: profile.id }, (err, existingUser) => {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Twitter account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, (err, user) => {

          user.twitterId = profile.id;
          user.twitterSecret = tokenSecret;
          user.twitterToken = accessToken;
          user.name = profile.displayName;
          user.avatar = profile._json.profile_image_url.replace('_normal.', '.');;

          user.save((err) => {
            req.flash('info', { msg: 'Twitter account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ twitterId: profile.id }, (err, existingUser) => {
      if (existingUser) {
        return done(null, existingUser);
      }
      var user = new User();

      user.twitterId = profile.id;
      user.twitterSecret = tokenSecret;
      user.twitterToken = accessToken;
      user.name = profile.displayName;
      user.avatar = profile._json.profile_image_url.replace('_normal.', '.');
      user.save((err) => {
        done(err, user);
      });
    });
  }
}));

passport.use('trello', new TrelloStrategy({
  requestTokenURL: 'https://trello.com/1/OAuthGetRequestToken',
  accessTokenURL: 'https://trello.com/1/OAuthGetAccessToken',
  userAuthorizationURL: 'https://trello.com/1/OAuthAuthorizeToken',
  consumerKey: process.env.TRELLO_API_KEY,
  consumerSecret: process.env.TRELLO_API_SECRET,
  callbackURL: '/auth/trello/callback',
  passReqToCallback: true,
  trelloParams: {
    scope: "read,write",
    name: "ga-test-app",
    expiration: "never"
  }
}, function(req, token, tokenSecret, profile, done) {
    User.findById(req.user._id, (err, user) => {
      user.trelloAccessToken = token;
      user.trelloSecret = tokenSecret;
      user.trelloId = profile._json.id;

      user.save((err) => {
        done(err, user);
      });
    });
}
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

var isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

/** end passport twitter auth **/


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

app.get('/login', passport.authenticate('twitter'));
app.get('/login/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/projects');
  }
);

app.get('/logout', function(req, res, next){
  req.logout();
  res.redirect('/');
});

app.get('/auth/trello', isAuthenticated, passport.authorize('trello'))
app.get('/auth/trello/callback', isAuthenticated, passport.authorize('trello', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/');
});


app.use('/projects', isAuthenticated, projects);
app.use('/project/:id', isAuthenticated, channels);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
