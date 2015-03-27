var mongoose = require('mongoose'),
	Room = require('./model/room');

var mongooseURI = process.env.MONGOLAB_URI || 'mongodb://localhost/chatApp';


mongoose.connect(mongooseURI, function ( err,res) {
    if(err){
        console.log('ERROR connecting to: ' + mongooseURI + '. ' + err);
    } else {
        console.log('Succeeded connecting to: ' + mongooseURI + '.');
    }
});

//Delete Existing rooms
Room.remove().exec();
//Rooms to init
var lobby = new Room({
	name : 'Lobby',
	createdDate : new Date(),
	requiresPassword : false,
	password : '',
	displayOrder: 0
}).save();

var openRoom = new Room({
	name : 'Open Room',
	createdDate : new Date(),
	requiresPassword : false,
	password : '',
	displayOrder: 1
}).save();

var lockedRoom = new Room({
	name : 'Locked Room',
	createdDate : new Date(),
	requiresPassword : true,
	password : 'password',
	displayOrder: 2
}).save();

var rooms = [lobby,openRoom,lockedRoom];

console.log(Room.find(roomCallback));

function roomCallback(docs){
	console.log(docs);
}