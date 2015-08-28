
    var express = require('express')
    	, app = express()
        , basicAuth = require('basic-auth-connect')
        , cookieParser = require('cookie-parser')
        , bodyParser = require('body-parser')
        , compression = require('compression')
        , favicon = require('express-favicon')
        , mongoose = require('mongoose')
        , passport = require('passport')
        , sanitizer = require('sanitizer')
        , session = require('express-session')
    	, MongoStore = require('connect-mongo')(session)
        , LocalStrategy = require('passport-local').Strategy
        , server = require('http').createServer(app)
    	, io = require('socket.io').listen(server)
    	, banner = require('./app/banner')
    	, logger = require('./app/logger')
    	, cacher = require('./app/cacher')
        , flash   = require('connect-flash')
        , engine = require('ejs-locals')
        , ChatLog = require('./model/chatLog')
    	, passportSocketIo = require("passport.socketio");


    var usernames = {};
    var rooms = {};

    var port = 3000;
    var mongooseURI ='mongodb://localhost/chatApp';

    var marvelAPI = {
        publicKey : 'ed27ed50f19f2ab2c44098a2ec18e8cb',
        privateKey : '249195ecfb9452872b1dcbce0deaf302b9bbe060'
    }

    var auth = basicAuth('Admin42', 'Pro1337p4ss');
    var Room = require('./model/room');
    var User = require('./model/user');
    var routes = require('./routes/routes');

    app.engine('ejs', engine);

    app.set('view engine','ejs');
    app.disable('x-powered-by');

    app.use(logger);
    app.use(banner);
    app.use(compression());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

    require('./config/passport')(passport);

    mongoose.connect(mongooseURI, function ( err, res ) {
    	if(err){ logger.log('','','','ERROR connecting to: ' + mongooseURI + '. ' + err,''); }
    	else { logger.log('','','','Succeeded connecting to: ' + mongooseURI,''); }
    });

    var sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });

    app.use(
        session({
            secret: 'keyboard cat',
            resave: false,
            saveUninitialized: false,
        	store: sessionStore
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static('public',{ maxAge: 120000 }));
    app.use('/phaser_assets',express.static('phaser_game',{ maxAge: 120000 }));
    app.use(flash());

    app.use(function(req, res, next) {
        res.header('X-Clacks-Overhead', 'GNU Terry Pratchett');
        next();
    });

    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    app.use('/',routes);

    app.get('/phaser',function(request,response){
        response.render('games/phaser');
    });

    app.get('/admin/logs',auth,function(request,response){
        response.render('pages/logs');
    });


    io.use(
        passportSocketIo.authorize({
        	cookieParser: cookieParser,
        	key:          'connect.sid',
        	secret:       'keyboard cat',
        	store:        sessionStore,
        	success:      onAuthorizeSuccess,
        	fail:         onAuthorizeFail,
        })
    );

    io.on('connection', function( socket ) {
        socket.lobbied = false;
        socket.emit( 'updaterooms' , makeRoomsSafeToSend( rooms ) , 'Lobby' );
        socket.emit( 'usercount' , io.sockets.sockets.length );
    		var userList = getRoomUsers('Lobby');
    		socket.emit( 'update user list' , userList );

    	socket.on( 'adduser' , function(){
          if( socket.request.user.logged_in ){
    			var username = socket.request.user.username;
    			socket.username = sanitizer.sanitize( username );
    			socket.room = 'Lobby';
                socket.lobbied = true;
    			usernames[socket.username] = {
    				username : socket.username,
    				socketId: socket.id
    			};
    			socket.join( 'Lobby' );
    			socket.emit( 'updatechat' , 'SERVER' , 'you have connected to Lobby' );
    			socket.broadcast.to( 'Lobby' ).emit( 'updatechat' , 'SERVER' , socket.username + ' has connected to this room' );
    			socket.emit( 'updaterooms' , makeRoomsSafeToSend( rooms ) , 'Lobby' );
    			socket.broadcast.emit( 'usercount',io.sockets.sockets.length );

    			var userList = getRoomUsers('Lobby');
    			socket.broadcast.to( 'Lobby' ).emit( 'update user list' , userList );
    			socket.emit( 'update user list' , userList);

    			var query = ChatLog.find({room:'Lobby'});
    			query.sort([['time',-1]]).limit(50);
    			query.exec(function(err, docs) {
    				if(err){
    					socket.emit('updatechat','SERVER','Error retrieving chat log :-(');
    				} else {
    					socket.emit('chat log', docs.map(
    						function(doc){
    							doc.message =  parseMessage(doc.message);
    							return doc;
    						})
    					);
    				}
    			});

           } else {
              socket.emit( 'updatechat', 'SERVER', 'You are not authorized to join rooms.' );
              socket.leave( socket.room );
          }
    	});

        socket.on('create',function(roomName,password){
            if(socket.request.user.logged_in && socket.lobbied){
                new Room({
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
            } else {
                socket.emit('updatechat', 'SERVER', 'You are not authorized to create rooms.');
                socket.leave(socket.room);
            }
        });

        socket.on('sendchat', function(data) {
            if(socket.request.user.logged_in  && socket.lobbied){
                var msg = parseMessage(data);
                io.sockets["in"](socket.room).emit('updatechat', socket.username, msg);
        		logger.chatLog(socket.username,	sanitizer.sanitize(data),socket.room,'sockets');
            } else {
                socket.emit('updatechat', 'SERVER', 'You are not authorized to send chat.');
                socket.leave(socket.room);
            }
        });

        socket.on('invite',function(to){
            if(socket.request.user.logged_in  && socket.lobbied){
              var reqFrom = socket.username;
              var socketId = usernames[to].socketId;
              var newRoomName = reqFrom + '-' + to + +new Date();

              rooms[newRoomName] = {
                  name : newRoomName,
                  requiresPassword: false,
                  password : '',
                  private : true
              };

              socket.broadcast.to(socketId).emit('updatechat','SERVER', reqFrom + ' has invited you to chat. <a href="#' + reqFrom + '" data-room="'+ newRoomName +'" class="join">Click here to join</a> <a href="#" class="decline" data-username="'+ reqFrom +'"> or Decline</a>');
              socket.emit('updatechat','SERVER', 'Private chat room has been created. <a href="#' + reqFrom + '" data-room="'+ newRoomName +'" class="join">Click here to join</a>');
             } else {
                socket.emit('updatechat', 'SERVER', 'You are not authorized to invite people to chat.');
                socket.leave(socket.room);
            }
        });

        socket.on('decline',function(username){
          var socketId = usernames[username].socketId;
          socket.broadcast.to(socketId).emit('updatechat','SERVER', 'Your invite was declined');
        });

        socket.on('switchRoom', function(newroom) {
            if(socket.request.user.logged_in  && socket.lobbied){
                if(rooms[newroom.name].password == newroom.password){

                    var oldroom;
                    oldroom = socket.room;
                    socket.leave(oldroom);

    				var oldList = getRoomUsers(oldroom);
    				socket.broadcast.to( oldroom ).emit( 'update user list' , oldList );
    				socket.broadcast.to( oldroom ).emit( 'updatechat' , 'SERVER', socket.username + ' has left this room');

                    socket.join(newroom.name);
    				socket.room = newroom.name;

    				var newList = getRoomUsers(newroom.name);

    				socket.broadcast.to( newroom.name ).emit( 'update user list' , newList );
                    socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
    				socket.emit( 'update user list' , newList);

    				var query = ChatLog.find({room:newroom.name});
    				query.sort([['time',-1]]).limit(50);
    				query.exec(function(err, docs) {
    					if(err){
    						socket.emit('updatechat','SERVER','Error retrieving chat log :-(');
    					} else {
    						socket.emit('chat log', docs.map(
    							function(doc){
    								doc.message =  parseMessage(doc.message);
    								return doc;
    							})
    						);
    					}
    				});

    				socket.emit('updaterooms', makeRoomsSafeToSend(rooms), newroom.name);

                    if(!rooms[newroom.name].private){
                      socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom.name);
                    } else {
                      socket.emit('updatechat', 'SERVER', 'you have connected to private chat.');
                    }

                    socket.broadcast.emit('usercount',io.sockets.sockets.length);


                } else {
                    socket.emit('updatechat', 'SERVER', 'you cant connect to that room. Incorrect password.');
                }
            } else {
                if(socket.lobbied){
                    socket.emit('updatechat', 'SERVER', 'You are not authorized to join rooms.');
                } else {
                    socket.emit('updatechat', 'SERVER', 'You should click join first.');
                }
                socket.leave(socket.room);
    						var userList = getRoomUsers('oldroom');
    						socket.broadcast.to( socket.room ).emit( 'update user list' , userList );
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

    function getRoomUsers(room){
    	var clients = io.sockets.adapter.rooms[room];
    	var users = [];
    	for (var clientId in clients ) {
    			var clientSocket = io.sockets.connected[clientId];
    			users.push(clientSocket.username);
    	}
    	return users;
    }

    function makeRoomsSafeToSend(rooms){
        var safeToSendRooms = {};
        Object.keys(rooms).forEach(function(key){
            var item = rooms[key];
            if(!item.private){
              safeToSendRooms[item.name] = {name:item.name,requiresPassword:item.requiresPassword};
            }
        });
        return safeToSendRooms;
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
                    };
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
                msg = '<br /><iframe width="560" height="315" src="https://www.youtube.com/embed/' + youtube_matches[1] + '" frameborder="0" allowfullscreen></iframe>';
        } else if( youtube_matches && youtube_matches.length > 0) {
          msg = ' <br /><i> You may only link one video at a time from youtube</i><br />';
        }
        return {data: data, msg: msg};
    }

    function onAuthorizeSuccess(data, accept){ accept(); }
    function onAuthorizeFail(data, message, error, accept){ accept(null, false); }

    initServer();
    app.start = app.listen = function(){
    	logger.log('','','','SERVER Starting up...','');
        return server.listen.apply(server, arguments);
    };
    app.start(port);
