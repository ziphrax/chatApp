var express = require('express')
	, app = express()
  	, server = require('http').createServer(app)
  	, io = require('socket.io').listen(server)
	, sanitizer = require('sanitizer')
    , favicon = require('express-favicon');

var logger = require('./app/logger');
var usernames = {};
var port = process.env.PORT || 5000
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
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.get('/',function(request,response){
	response.sendFile(__dirname + '/public/index.html');    
});
app.get('/terms-of-service',function(request,response){
	response.sendFile(__dirname + '/public/terms.html');    
});

app.get('/news',function(request,response){
	response.sendFile(__dirname + '/public/news.html');    
});

app.get('/users',function(request,response){
    response.sendFile(__dirname + '/public/users.html');        
});

app.get('/data/users',function(request,response){    
    response.json(usernames);    
    response.end();
});

io.sockets.on('connection', function(socket) {

    socket.emit('usercount',io.sockets.sockets.length);  

    socket.on('adduser', function(username) {
        if(validateUsername(username)){
            socket.username = sanitizer.sanitize(username);
            socket.room = 'Lobby';
            usernames[socket.username] = socket.username;
            socket.join('Lobby');
            socket.emit('updatechat', 'SERVER', 'you have connected to Lobby');
            socket.broadcast.to('Lobby').emit('updatechat', 'SERVER', socket.username + ' has connected to this room');
            socket.emit('updaterooms', makeRoomsSafeToSend(rooms), 'Lobby');    
            socket.broadcast.emit('usercount',io.sockets.sockets.length);  
        } else {            
            socket.disconnect();
        }        
    });

    /*socket.on('create', function(room) {
        //rooms.push(room);
        socket.emit('updaterooms', rooms, socket.room);
    });*/

    socket.on('sendchat', function(data) {
        io.sockets["in"](socket.room).emit('updatechat', socket.username, sanitizer.sanitize(data));
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
            socket.broadcast.emit('usercount',io.sockets.sockets.length);        
            socket.emit('updaterooms', makeRoomsSafeToSend(rooms), newroom.name);            
        } else {
            socket.emit('updatechat', 'SERVER', 'you cant connect to that room. Incorrect password.');
        }
    });

    socket.on('disconnect', function() {
        delete usernames[socket.username];
        io.sockets.emit('updateusers', usernames);
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.broadcast.emit('usercount',io.sockets.sockets.length);               
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

function validateUsername(name){
    var isValid = true;
    if((name || '').length < 4){
        isValid = false;
    }
    if(usernames[name])
    {
        isValid = false;
    }
    return isValid
}

app.start = app.listen = function(){
  return server.listen.apply(server, arguments)
}

app.start(port)
