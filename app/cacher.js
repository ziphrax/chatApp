module.exports = function cacher(request,response,next){
	response.header('Cache-Control', 'max-age=120');
	response.header('ETag','x234dff');
	next();
}