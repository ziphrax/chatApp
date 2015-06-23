var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new mongoose.Schema({
 	username: String,
 	password: String,
 	firstname: String,
 	lastname: String,
 	emailaddress: String,
	sex: String,
	pref_voice: String,
	avatarURL: String,
	avatarIMG: String,
	interests: [String],
	preferedVoice: String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
