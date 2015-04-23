var Log = require('../model/log');
var ChatLog = require('../model/chatLog');

module.exports = function logger(request,response,next){
	var start = +new Date();
	var stream = process.stdout;
	var url = request.url;
	var method = request.method;
	var ip = request.headers['x-real-ip'] || request.connection.remoteAddress;

	response.on('finish', function(){
		var duration = +new Date() -  start;
		var log = new Log({
			time:new Date(),
			url: url,
			method: method,
			ip:ip,
			duration: duration
		}).save(function(err){
			if(err){
				console.err(err);
			}
		});
		stream.write(ip + ': '+ method + ' ' + url + ' ' + duration + ' ms' + ' \n');
	});

	next();
}

module.exports.log = function log(url,method,ip,message,duration){
	var stream = process.stdout;

	url: url || '';
	method: method || '';
	ip:ip || '';
	message: message || '';
	duration: duration || '';

	var log = new Log({
		time:new Date(),
		url: url,
		method: method,
		ip:ip,
		message: message,
		duration: duration
	}).save(function(err){
		if(err){
			console.err(err);
		}
	});
	stream.write(ip + ': '+ method + ' ' + url + ' ' + message + ' '+ duration + '\n');
}

module.exports.chatLog = function chatLog(username,message,room,ip){
	var stream = process.stdout;

	username = username || '';
	message = message || '';
	room = room || '';
	ip = ip || '';

	var log = new ChatLog({
		time:new Date(),
		username: username,
		message: message,
		room: room,
		ip: ip
	}).save(function(err){
		if(err){
			console.err(err);
		}
	});
}
