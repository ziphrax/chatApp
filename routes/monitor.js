var express = require('express');
var router = express.Router();
var os = require('os');

router.route('/')
  .get(function(req,res){
    if(req.user && req.user.username == 'admin42' ){
      res.render('monitoring/index', { user : req.user, os: getOSDetails()});
    } else {
      res.status(404).send();
    }
  });

router.route('/data')
  .get(function(req,res){
    if(req.user && req.user.username == 'admin42' ){
      res.json(getOSDetails());
    } else {
      res.status(404).send();
    }
  });6

function getOSDetails(){
  return {
    "hostname" : os.hostname(),
    "type": os.type(),
    "platform":os.platform(),
    "release":os.release(),
    "uptime": ( os.uptime() / 60 ).toFixed(0),
    "uptimesecs": (os.uptime() % 60).toFixed(0),
    "loadavg1":os.loadavg()[0],
    "loadavg5":os.loadavg()[1],
    "loadavg15":os.loadavg()[2],
    "totalmem": (os.totalmem() / 1024 / 1024 / 1024 ).toFixed(1),
    "freemem": (os.freemem() / 1024 / 1024 / 1024 ).toFixed(1),
    "cpusmodel":os.cpus()[0].model,
    "cpuslength":os.cpus().length,
    "networkInterfaces":os.networkInterfaces()
  }
}

module.exports = router;
