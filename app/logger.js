module.exports = function logger(request,response,next){
	var start = +new Date();
	var stream = process.stdout;
	var url = request.url;
	var method = request.method;
	var ip = request.headers['x-fowarded-for'] || request.connection.remoteAddress;

	response.on('finish', function(){
		var duration = +new Date() -  start;
		var message = ip + ': '+ method + ' ' + url + ' ' + duration + ' ms \n';
		stream.write(message);
	});

	next();
}