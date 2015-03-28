var mongoose = require('mongoose');
var LogSchema = new mongoose.Schema({
  time: Date,
  message: String,
  url: String,
  method: String,
  ip: String,
  duration: String
});

module.exports = mongoose.model('Log',LogSchema);
