var mongoose = require('mongoose');
var Channel = require('./Channel');

var projectsSchema = new mongoose.Schema({
  user: {type:mongoose.Schema.ObjectId, ref:'User'},

  social: {type:[{}]},  // easier to store facebook, twitter, instagram, website
  name: {type: String, required:true},
  tag: {type:String},
  channels:[{ type:mongoose.Schema.ObjectId, ref:'Channel', unique: true }]
}, { timestamps: true });

// projectsSchema.pre('save', function (next) {

// });

var Project = mongoose.model('Project', projectsSchema);

module.exports = Project;