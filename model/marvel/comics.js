var request = require('request');
var md5 = require('MD5');
var marvelAPI = {
    publicKey : 'ed27ed50f19f2ab2c44098a2ec18e8cb',
    privateKey : '249195ecfb9452872b1dcbce0deaf302b9bbe060'
};
var baseURL = 'http://gateway.marvel.com/';
var namespace = 'v1/public/';

function hash(ts)
{
	return md5.digest_s(ts + marvelAPI.privateKey + marvelAPI.publicKey);
}

module.exports.find = function(comic_id,callback){
	var ts = +new Date();
	if(comic_id){
		var url = baseURL + namespace + 'comics/' + comic_id + '?ts=' + ts + '&apikey=' + marvelAPI.publicKey + '&hash=' + hash(ts);		
	} else {
		var url = baseURL + namespace + 'comics?ts=' + ts + '&apikey=' + marvelAPI.publicKey + '&hash=' + hash(ts);
	}	
	request(  url ,function(err,response,body){
		callback(err,response,body); // Show the HTML for the Google homepage. 
	});	
}