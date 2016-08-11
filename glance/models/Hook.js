var mongoose = require('mongoose');

var hookSchema = new mongoose.Schema({
  user: {type:mongoose.Schema.ObjectId, ref:'User'},
  project: {type:mongoose.Schema.ObjectId, ref:'Project'},
  channel: {type:mongoose.Schema.ObjectId, ref:'Channel'},
  externalId: {type:String},
  meta: {type:Object},
  initMeta: {type:Object}
}, { timestamps: true });

var Hook = mongoose.model('Hook', hookSchema);

module.exports = Hook;