var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({
	title : String,
	content: String,
	status: String,
	votes: Number,
	created: Date,
	updated: Date,
	owner: String
});

module.exports = mongoose.model('Article',ArticleSchema);
