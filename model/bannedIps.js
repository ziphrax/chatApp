var mongoose = require('mongoose');
var BannedIPSchema = new mongoose.Schema({
  time: Date,
  reason: String,
  ip: String
});

module.exports = mongoose.model('BannedIP',BannedIPSchema);
