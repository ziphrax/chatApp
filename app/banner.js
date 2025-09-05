/* global process */
var BannedIP = require('../model/bannedIps');
var logger = require('../app/logger');
var sanitizer = require('sanitizer')

module.exports = function banner(request,response,next){
  var ip = request.headers['x-real-ip'] || request.connection.remoteAddress;

  BannedIP.find({ip: ip}).then(function(docs){
    if(docs && docs.length > 0){
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
  }).catch(function(err){
    console.log(err);
    response.status(500).send('Internal Error');
  });
}

function banIP(IPAddress,Reason){
  var ip = new BannedIP({
    time: new Date(),
    reason: Reason,
    ip: IPAddress
  });
  ip.save().catch(function(err){
		console.error(err);
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
