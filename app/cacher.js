module.exports = function cacher(request,response,next){
	res.header('Cache-Control', 'max-age=120');
	res.header('ETag','x234dff');
	next();
}