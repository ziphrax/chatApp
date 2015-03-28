var mongoose = require('mongoose');
var ChatLogSchema = new mongoose.Schema({
  username: String,
  time: Date,
  message: String,
  room: String,
  ip: String
});

module.exports = mongoose.model('ChatLog',ChatLogSchema);
