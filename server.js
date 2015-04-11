var express = require('express')
    , basicAuth = require('basic-auth-connect')
	  , app = express()
  	, server = require('http').createServer(app)
  	, io = require('socket.io').listen(server)
	  , sanitizer = require('sanitizer')
    , favicon = require('express-favicon')
    , compression = require('compression')
    , mongoose = require('mongoose')
    , ipfilter = require('express-ipfilter')
    , bodyParser = require('body-parser');

var Room = require('./model/room');
var Log = require('./model/log');
var ChatLog = require('./model/chatLog');
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
var ips = ['218.17.147.45','72.51.39.202','58.177.86.10'];
//just for testing
var auth = basicAuth('Admin42', 'Pro1337p4ss');

var surveys = require('./routes/surveys');

app.use(logger);
app.use(cacher);
app.use(ipfilter(ips));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public',{ maxAge: 120000 }));


app.use('/surveys',auth,surveys);
app.get('/new-survey',auth,function(request,response){
  response.render('pages/new-survey');
});

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

app.get('/admin/logs',auth,function(request,response){
    response.render('pages/logs');
});

app.get('/data/logs/dailyhitrate/:token',auth,function(request,response){
    if(request.params.token == '241085.0129'){
        var options = {};
        options.map = function(){
            var d = this.time;
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
            d.setMilliseconds(0);
            emit(d,this.ip);
        }

        options.reduce = function(key,values){
            var sum = 0;
            for(var v in values){
                sum += 1;
            }
            return sum;
        };

        Log.mapReduce(options,function(err,results,stats){
            if(err){
                console.log(err);
                response.status(500).send(err);
            } else {
                console.log("hitrate map reduce took %d ms", stats.processtime);
                response.json(results);
            }
        });
    } else {
        response.status(401).send('Unauthorized');
    }
});

app.get('/data/logs/raw/:token',auth,function(request,response){
    if(request.params.token == '241085.0129'){
        Log.find().exec(function(err,docs){
            if(err){
                console.log(err);
                response.status(500).send(err);
            } else {
                response.json(docs);
                response.end();
            }
        });
    } else {
        response.status(401).send('Unauthorized');
    }

});

app.get('/data/chatlogs/:token',auth,function(request,response){
    if(request.params.token == '241085.0129'){
        ChatLog.find().exec(function(err,docs){
            if(err){
                console.log(err);
                response.status(500).send(err);
            } else {
                response.json(docs);
                response.end();
            }
        });
    } else {
        response.status(401).send('Unauthorized');
    }

});

io.sockets.on('connection', function(socket) {

    socket.emit('usercount',io.sockets.sockets.length);

    socket.on('adduser', function(username) {
        if(validateUsername(username)){
            socket.username = sanitizer.sanitize(username);
            socket.room = 'Lobby';
            usernames[socket.username] = {
                username : socket.username,
                socketId: socket.id
            };
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
        var msg = parseMessage(data);
        io.sockets["in"](socket.room).emit('updatechat', socket.username, msg);
		    logger.chatLog(socket.username,	sanitizer.sanitize(data),socket.room,'sockets');
    });

    socket.on('invite',function(from,to){
      var socketId = usernames[to].socketId;
      var newRoomName = from + '-' + to + +new Date();

      rooms[newRoomName] = {
          name : newRoomName,
          requiresPassword: false,
          password : '',
          private : true
      };

      socket.broadcast.to(socketId).emit('updatechat','SERVER', from + ' has invited you to chat. <a href="#' + from + '" data-room="'+ newRoomName +'" class="join">Click here to join</a> <a href="#" class="decline" data-username="'+ from +'"> or Decline</a>');
      socket.emit('updatechat','SERVER', 'Private chat room has been created. <a href="#' + from + '" data-room="'+ newRoomName +'" class="join">Click here to join</a>');
    });

    socket.on('decline',function(username){
      var socketId = usernames[username].socketId;
      socket.broadcast.to(socketId).emit('updatechat','SERVER', 'Your invite was declined');
    });

    socket.on('switchRoom', function(newroom) {
        if(rooms[newroom.name].password == newroom.password){
            var oldroom;
            oldroom = socket.room;
            socket.leave(socket.room);
            socket.join(newroom.name);
            if(!rooms[newroom.name].private){
              socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom.name);
            } else {
              socket.emit('updatechat', 'SERVER', 'you have connected to private chat.');
            }
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
        if(socket.username){
            socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        }
        socket.broadcast.emit('usercount',io.sockets.sockets.length);
        socket.leave(socket.room);
    });
 });

function makeRoomsSafeToSend(rooms){
    var safeToSendRooms = {};
    Object.keys(rooms).forEach(function(key){
        var item = rooms[key];
        if(!item.private){
          safeToSendRooms[item.name] = {name:item.name,requiresPassword:item.requiresPassword};
        }
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

function parseMessage(data){
    var parsedImageData = parseImageURLS(data);
    data = parsedImageData.data;

    var parseYoutubeData = parseYoutubeMessage(data);
    data = parseYoutubeData.data;

    var msg =  sanitizer.sanitize(data) + parsedImageData.msg + parseYoutubeData.msg;

    return msg;
}

function parseImageURLS(data){
    data = data.replace(re,'');
    var re = /\bhttps?:[^)''"]+\.(?:jpg|jpeg|gif|png)/ig;
    var img_matches = data.match(re);
    var msg = '';
    if(img_matches && img_matches.length > 0){
        for(var i = 0; i< img_matches.length;i++){
            msg += "<br /><img class='img-rounded' src='" + img_matches[i] +"' width='300'/>";
        }
    }

    return {data: data, msg: msg};
}

function parseYoutubeMessage(data){
    data = data.replace(youtube,'');
    var youtube = /^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
    var youtube_matches = data.match(youtube);
    var msg = '';
    if(youtube_matches && youtube_matches.length == 2){
        console.log(youtube_matches);
            msg = '<br /><iframe width="560" height="315" src="https://www.youtube.com/embed/' + youtube_matches[1] + '" frameborder="0" allowfullscreen></iframe>';
    } else if( youtube_matches && youtube_matches.length > 0) {
      msg = ' <br /><i> You may only link one video at a time from youtube</i><br />';
    }
    return {data: data, msg: msg};
}

initServer();
app.start = app.listen = function(){
	logger.log('','','','SERVER Starting up...','');
  return server.listen.apply(server, arguments)
}

app.start(port)
