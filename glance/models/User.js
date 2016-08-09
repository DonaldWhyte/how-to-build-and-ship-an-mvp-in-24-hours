var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  username: {type:String},
  name: {type:String},
  avatar: {type:String},

  twitterToken: {type:String},
  twitterId: {type:String, unique:true, index:true},
  twitterSecret: {type:String}

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;