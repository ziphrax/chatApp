var request = require('axios');
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

module.exports.find = function(character_id,offset,search,callback){
	var ts = +new Date();
	var url = '';
  
	if(character_id){
		url = baseURL + namespace + 'characters/' + character_id + '?ts=' + ts + '&apikey=' + marvelAPI.publicKey + '&hash=' + hash(ts);
	} else {
		url = baseURL + namespace + 'characters?ts=' + ts + '&offset=' + offset + '&apikey=' + marvelAPI.publicKey + '&hash=' + hash(ts);// + (search?'&titleStartsWith=' + search:'');
	}

	request( url ,function(err,res,body){
		callback(err,res,body,search); // Show the HTML for the Google homepage.
	});
}
