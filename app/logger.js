var mongoose = require('mongoose');
var LogSchema = new mongoose.Schema({
	time: Date,
	message: String,
	ip: String
});

var Log = mongoose.model('Log',LogSchema);

module.exports = function logger(request,response,next){
	var start = +new Date();
	var stream = process.stdout;
	var url = request.url;
	var method = request.method;
	var ip = request.headers['x-fowarded-for'] || request.connection.remoteAddress;

	response.on('finish', function(){
		var duration = +new Date() -  start;
		var message =   method + ' ' + url + ' ' + duration + ' ms';
		var log = new Log({
			time:new Date(),
			ip:ip,
			message:message
		}).save(function(err){
			if(err){
				console.err(err);
			}
		});
		stream.write(ip + ': '+ message + ' \n');
	});

	next();
}
