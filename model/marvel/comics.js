var request = require('request');
var md5 = require('md5');
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

module.exports.find = function(comic_id,offset,search,callback){
	var ts = +new Date();
	var url = '';

	if(comic_id){
		url = baseURL + namespace + 'comics/' + comic_id + '?ts=' + ts + '&orderBy=title&apikey=' + marvelAPI.publicKey + '&hash=' + hash(ts);
	} else {
		url = baseURL + namespace + 'comics?ts=' + ts + '&offset=' + offset + '&orderBy=title&apikey=' + marvelAPI.publicKey + '&hash=' + hash(ts) + (search?'&titleStartsWith=' + search:'');
	}

	request( url ,function(err,res,body){
		callback(err,res,body,search); // Show the HTML for the Google homepage.
	});
}
