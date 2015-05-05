var mongoose = require('mongoose');
var Question = require('../model/question');
var Ticket = require('../model/ticket');
var express = require('express');
var router = express.Router();

router.route('/')
  .get(function(req,res){
    var query = Ticket.find({status:{'$ne': 'Closed'}});
     query.sort([['votes',-1]]);
     query.exec(function(err, docs) {
      if(err){
        res.status(500).send(err);
      } else {
        res.json(docs);
        res.end();
      }
    });
  }).post(function(req,res){
    if(req.user){
      var ticket = new Ticket();

      ticket.title = req.body.title;
      ticket.content = req.body.content;
      ticket.status = 'New';
      ticket.votes = 1;
      ticket.created = new Date();
      ticket.owner = req.user.username;
      ticket.updated = new Date();

      ticket.save(function(err){
        if(err) {
          res.status(500).send(err);
        } else {
          res.json({message: 'Ticket saved successfully',data: ticket});
        }
      });
    }
  });

router.route('/:id')
.post(function(req,res){
  Ticket.findOne({_id: req.params.id},function(err,ticket){
    if(err){
      return res.status(500).send(err);
    } else {

      if(req.user.username = ticket.owner){
        ticket.title = req.body.title;
        ticket.content = req.body.content;
      }

      ticket.status = req.body.status;
      ticket.votes = req.body.votes;
      ticket.updated = new Date();

      ticket.save(function(err){
          if(err){
            return res.send(err);
          } else {
            res.json({message: 'Ticket updated successfully',data:ticket});
          }
      });
    }
  });
}).get(function(req,res){
  Ticket.findOne({ _id: req.params.id}, function(err, ticket) {
   if (err) {
     return res.send(err);
   } else {
      res.json(ticket);
   }
 });
}).delete(function(req,res){
    res.status(403).json({message: 'You can only close tickets, not delete them.'});
});

router.route('/downvote/:id')
  .post(function(req,res){
    if(req.user){
     Ticket.findOne({ _id: req.params.id}, function(err, ticket) {
       if (err) {
         return res.send(err);
       } else {
          ticket.votes = ticket.votes - 1;
          ticket.save();
          res.json({message:'Downvote Success'});
       }
     });
    } else {
      res.status(403).send('Request Denied');
    }
  });

router.route('/upvote/:id')
  .post(function(req,res){
    if(req.user){
      Ticket.findOne({ _id: req.params.id}, function(err, ticket) {
       if (err) {
         return res.send(err);
       } else {
          ticket.votes = ticket.votes + 1;
          ticket.save();
          res.json({message:'Downvote Success'});
       }
     });
    } else {
      res.status(403).send('Request Denied');
    }
  });

module.exports = router;
