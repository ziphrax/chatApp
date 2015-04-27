var mongoose = require('mongoose');
var QuestionSchema = require('../model/question');

var TicketSchema = new mongoose.Schema({
	title : String,
	content: String,
	status: String,
	votes: int,
	created: Date,
	updated: Date
});

module.exports = mongoose.model('Ticket',TicketSchema);
