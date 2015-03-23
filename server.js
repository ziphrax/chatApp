var express = require('express')
	, app = express()
  	, server = require('http').createServer(app)
  	, io = require('socket.io').listen(server);

var logger = require('./app/logger');

app.use(logger);
app.use(express.static('public'));

app.get('/',function(request,response){
	response.sendFile(__dirname + '/public/index.html');
});

app.get('/data', function(request,response){
	response.send(['London','Brighton','Canterbury']);
	response.end();
});

io.on('connection',function(socket){
	console.log('io: a user connected');
	socket.on('login',function(username){
		console.log('User has set username to: ' + username);
	});
	socket.on('chat message',function(msg){
		console.log('message: ' + msg);
		io.emit('chat message',msg);
	});
	socket.on('disconnect', function(){
		console.log('io: a user disconnected');
	});
}); 


app.start = app.listen = function(){
  return server.listen.apply(server, arguments)
}

app.start(3000)