var express = require('express')
	, app = express()
  	, server = require('http').createServer(app)
  	, io = require('socket.io').listen(server)
	, sanitizer = require('sanitizer');

var logger = require('./app/logger');
var usernames = {};
var rooms = {
    'Lobby' : {
        name : 'Lobby',
        requiresPassword: false,
        password : ''
    },
    'Open Room' : {
        name : 'Open Room',
        requiresPassword: false,
        password : ''
    },
    'Locked Room' : {
        name : 'Locked Room',
        requiresPassword: true,
        password : 'password'
    }
};

app.use(logger);
app.use(express.static('public'));
app.get('/',function(request,response){
	response.sendFile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function(socket) {
    socket.on('adduser', function(username) {
        socket.username = username;
        socket.room = 'Lobby';
        usernames[username] = username;
        socket.join('Lobby');
        socket.emit('updatechat', 'SERVER', 'you have connected to Lobby');
        socket.broadcast.to('Lobby').emit('updatechat', 'SERVER', username + ' has connected to this room');       
        socket.emit('updaterooms', makeRoomsSafeToSend(rooms), 'Lobby');
    });

    /*socket.on('create', function(room) {
        //rooms.push(room);
        socket.emit('updaterooms', rooms, socket.room);
    });*/

    socket.on('sendchat', function(data) {
        io.sockets["in"](socket.room).emit('updatechat', socket.username, data);
    });

    socket.on('switchRoom', function(newroom) {
        if(rooms[newroom.name].password == newroom.password){
            var oldroom;
            oldroom = socket.room;
            socket.leave(socket.room);
            socket.join(newroom.name);
            socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom.name);
            socket.broadcast.to(oldroom).emit('updatechat', 'SERVER', socket.username + ' has left this room');
            socket.room = newroom.name;
            socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
            socket.emit('updaterooms', rooms, newroom.name);
        } else {
            socket.emit('updatechat', 'SERVER', 'you cant connect to that room. Incorrect password.');
        }
    });

    socket.on('disconnect', function() {
        delete usernames[socket.username];
        io.sockets.emit('updateusers', usernames);
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });
 });

function makeRoomsSafeToSend(rooms){
    var safeToSendRooms = {};
    Object.keys(rooms).forEach(function(key){
        var item = rooms[key];
        safeToSendRooms[item.name] = {name:item.name,requiresPassword:item.requiresPassword};
    });
    return safeToSendRooms
}

app.start = app.listen = function(){
  return server.listen.apply(server, arguments)
}

app.start(3000)
