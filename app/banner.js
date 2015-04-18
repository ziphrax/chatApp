var BannedIP = require('../model/bannedIps');
var logger = require('../app/logger');
var sanitizer = require('sanitizer')

module.exports = function banner(request,response,next){
  var start = +new Date();
  var stream = process.stdout;
  var url = request.url;
  var method = request.method;
  var ip = request.headers['x-fowarded-for'] || request.connection.remoteAddress;

  BannedIP.find({ip: ip},function(err,docs){
    if(err){
      console.log(err);
      response.status(500).send('Internal Error');
    } else {
      if(docs.length > 0){
        logger.log('','DeniedIP',ip,'IPBanned' ,'');
        response.status(401).send('Request Denied');
      } else {
        var passesRequestCheck = checkRequest(ip,request.url);
        if(passesRequestCheck){
          next();
        } else {
          response.status(401).send('Request Denied');
        }
      }
    }
  });
}

function banIP(IPAddress,Reason){
  var ip = new BannedIP({
    time: new Date(),
    reason: Reason,
    ip: IPAddress
  }).save(function(err){
		if(err){
			console.err(err);
		}
	});
  //url,method,ip,message,duration
  logger.log('','IPBanned',IPAddress,Reason ,'');
}

function checkRequest(IPAddress,request){
  var result = true;
  var re = /(\/cgi-bin|\/php|.cgi|.php|HTTP|cfg|git|w00tw00t)/ig;

  if(request.match(re)){
    result = false;
  }

  if(result == false){
    banIP(IPAddress,'Dodgy Request: ' + sanitizer.sanitize(request));
  }
  return result;
}