var mongoose = require('mongoose');

var WeaponSchema = new mongoose.Schema({
	title : String,
  description: String,
	imageUrl: String,
	status: String,
	strength: Number,
	armourPenetration: Number,
  accuracy: Number,
	weaponType: String
});

module.exports = mongoose.model('Weapon',WeaponSchema);
