var mongoose = require('mongoose');

var XenosSchema = new mongoose.Schema({
	title : String,
  description: String,
	imageUrl: String,
	status: String,
	strength: Number,
  toughness: Number,
	health: Number,
  faction: String,
  level: Number
});

module.exports = mongoose.model('Xenos',XenosSchema);
