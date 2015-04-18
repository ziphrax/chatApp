var mongoose = require('mongoose');
var NoteSchema = new mongoose.Schema({
  time: Date,
  content: String,
  owner: String,
  from: String,
  tags: [String]
});

module.exports = mongoose.model('Note',NoteSchema);
