var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
 	username: String,
 	password: String,
 	firstname: String,
 	lastname: String,
 	emailaddress: String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
