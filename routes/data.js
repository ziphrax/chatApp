var basicAuth = require('basic-auth-connect');
var express = require('express');
var router = express.Router();
var notes = require('../routes/notes');
var auth = basicAuth('Admin42', 'Pro1337p4ss');
var Log = require('../model/log');
var ChatLog = require('../model/chatLog');

router.use('/notes',notes);

router.route('/logs/dailyhitrate/:token')
  .get(auth,function(request,response){
    if(request.params.token == '241085.0129'){
        var options = {};
        options.map = function(){
            var d = this.time;
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
            d.setMilliseconds(0);
            emit(d,this.ip);
        }

        options.reduce = function(key,values){
            var sum = 0;
            for(var v in values){
                sum += 1;
            }
            return sum;
        };

        Log.mapReduce(options,function(err,results,stats){
            if(err){
                console.log(err);
                response.status(500).send(err);
            } else {
                console.log("hitrate map reduce took %d ms", stats.processtime);
                response.json(results);
            }
        });
    } else {
        response.status(401).send('Unauthorized');
    }
});

router.route('/logs/raw/:token')
  .get(auth,function(request,response){
    if(request.params.token == '241085.0129'){
        Log.find().exec(function(err,docs){
            if(err){
                console.log(err);
                response.status(500).send(err);
            } else {
                response.json(docs);
                response.end();
            }
        });
    } else {
        response.status(401).send('Unauthorized');
    }
});

router.route('/chatlogs/:token')
  .get(auth,function(request,response){
    if(request.params.token == '241085.0129'){
        ChatLog.find().exec(function(err,docs){
            if(err){
                console.log(err);
                response.status(500).send(err);
            } else {
                response.json(docs);
                response.end();
            }
        });
    } else {
        response.status(401).send('Unauthorized');
    }

});

module.exports = router;
