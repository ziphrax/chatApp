var express = require('express')
		, app = express()
  	, server = require('http').createServer(app)
  	, io = require('socket.io').listen(server)
		, sanitizer = require('sanitizer')
    , favicon = require('express-favicon')
    , compression = require('compression')
    , mongoose = require('mongoose');

var Room = require('./model/room');

var logger = require('./app/logger');
var cacher = require('./app/cacher');
var usernames = {};
var port = process.env.PORT || 80;
var mongooseURI = process.env.MONGOLAB_URI || 'mongodb://localhost/chatApp';

mongoose.connect(mongooseURI, function ( err,res) {
    if(err){
        console.log('ERROR connecting to: ' + mongooseURI + '. ' + err);
    } else {
        console.log('Succeeded connecting to: ' + mongooseURI);
    }
});

app.set('view engine','ejs');

var rooms = {};

app.use(logger);
app.use(cacher);
app.use(compression());
app.use(express.static('public',{
    maxAge: 120000
}));
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.get('/',function(request,response){
	response.render('pages/index');
});
app.get('/terms-of-service',function(request,response){
	response.render('pages/terms');
});

app.get('/news',function(request,response){
	response.render('pages/news');
});

app.get('/users',function(request,response){
	response.render('pages/users');
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
            socket.emit('updatechat','SERVER','username already in use');
            socket.disconnect();
        }
    });

    socket.on('create',function(roomName,password){
        var newRoom = new Room({
            name : sanitizer.sanitize(roomName),
            createdDate : new Date(),
            requiresPassword : password.length > 0,
            password : password,
            displayOrder: Object.keys(rooms).length + 1
        }).save(function(err){
            console.error(err);
        });
        rooms[sanitizer.sanitize(roomName)] = {
            name : sanitizer.sanitize(roomName),
            requiresPassword: password.length > 0,
            password : password
        };
        socket.emit('updatechat', 'SERVER', 'New Room has been created: ' + sanitizer.sanitize(roomName));
        socket.emit('updaterooms', makeRoomsSafeToSend(rooms), sanitizer.sanitize(roomName));
    });

    socket.on('sendchat', function(data) {
        io.sockets["in"](socket.room).emit('updatechat', socket.username, sanitizer.sanitize(data));
				logger.chatLog(socket.username,	sanitizer.sanitize(data),socket.room,'sockets');
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

function initServer(){
    var roomQuery = Room.find({}).sort([['requiresPassword','ascending'],['displayOrder','ascending']]);
    roomQuery.exec(function(err,docs){
        if(err){
            console.log('Error.initServer: ' + err);
        } else {
            docs.forEach(function(room){
                rooms[room.name] = {
                    name : room.name,
                    requiresPassword: room.requiresPassword,
                    password : room.password
                }
            });
        }
    });
}

initServer();
app.start = app.listen = function(){
	logger.log('','','','SERVER Starting up...','');
  return server.listen.apply(server, arguments)
}

app.start(port)
