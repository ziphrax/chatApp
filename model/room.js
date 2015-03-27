var mongoose = require('mongoose');
var RoomSchema = new mongoose.Schema({
	name : String,
	createdDate : Date,
	requiresPassword : Boolean,
	password : String,
	displayOrder: Number
});

module.exports = mongoose.model('Room',RoomSchema);