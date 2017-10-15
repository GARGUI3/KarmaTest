var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var TweetsSchema = new Schema({
  tweetId: String,
  busquedaId: String,
  body: String,
  link: String,
  postedTime: Date,
  verb: String
});

module.exports = mongoose.model('tweets', TweetsSchema);
