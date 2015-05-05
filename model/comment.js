var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
	content: String,
	status: String,
	created: Date,
	updated: Date,
	owner: String,
  user: String
});

module.exports = mongoose.model('Comment',CommentSchema);
