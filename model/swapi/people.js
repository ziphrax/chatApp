var request = require('request');
var baseURL = 'http://swapi.co/';
var namespace = 'api/';

module.exports.find = function(person_id,callback){	
	var url = '';

	if(person_id){
		url = baseURL + namespace + 'people/' + person_id;
	} else {
		url = baseURL + namespace + 'people';
	}

	console.log(url);

	request( url ,function(err,res,body){
	    var safeBody = body.replace(/http:/g, 'https:');
		callback(err,res,safeBody); 
	});
}
