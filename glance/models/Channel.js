var mongoose = require('mongoose');

var channelSchema = new mongoose.Schema({
    type: {type:String, index:true}, // we'll keep it string, but it should be an enum - but we should index it as we're going to sort on it
    user: {type:mongoose.Schema.ObjectId, ref:'User'}, // we need to know the user because we'll be using the access token to get the external things
    externalId: {type:String, index:true}, // mongoose will use an internal ID, but we'll need an external id of the object - this will be different per channel
    total: {type:Number},
    completed: {type:Number},
    project: {type:mongoose.Schema.ObjectId, ref:'Project'}
});

var Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;