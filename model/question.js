var mongoose = require('mongoose');
var QuestionSchema = new mongoose.Schema({
  name: String,
  description: String,
  text: String,
  type: String,
  answers: [String]
});

module.exports = mongoose.model('Question',QuestionSchema);
