var basicAuth = require('basic-auth-connect');
var express = require('express');
var router = express.Router();
var notesRoute = require('../routes/notes');
var ticketsRoute = require('../routes/tickets');
var articlesRoute = require('../routes/articles');
var commentsRoute = require('../routes/comments');
var auth = basicAuth('Admin42', 'Pro1337p4ss');
var Log = require('../model/log');
var User = require('../model/user');
var ChatLog = require('../model/chatLog');

router.use('/notes',notesRoute);
router.use('/tickets',ticketsRoute);
router.use('/articles',articlesRoute);
router.use('/comments',commentsRoute);

router.route('/logs/dailyhitrate/')
  .get(auth,function(request,response){
      var options = {};
      options.map = function(){
          var d = new Date();
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
              console.log("hitrate map reduce took %d ms", stats ? stats.processtime : 'unknown');
              response.json(results);
          }
      });
});
router.route('/logs/')
  .get(auth,function(request,response){
      Log.find().sort({'time':-1}).limit(100).exec(function(err,docs){
          if(err){
              console.log(err);
              response.status(500).send(err);
          } else {
              response.json(docs);
              response.end();
          }
      });
});
router.route('/chatlogs/')
  .get(auth,function(request,response){
      ChatLog.find().exec(function(err,docs){
          if(err){
              console.log(err);
              response.status(500).send(err);
          } else {
              response.json(docs);
              response.end();
          }
      });
});
router.route('/chatlogs/:username')
  .get(auth,function(request,response){
      ChatLog.find({username:request.params.username}).exec(function(err,docs){
          if(err){
              console.log(err);
              response.status(500).send(err);
          } else {
              response.json(docs);
              response.end();
          }
      });
});
router.route('/users')
  .get(function(request,response){
    User.find().exec(function(err,docs){
      response.json(docs);
  		response.end();
    });
});
module.exports = router;
