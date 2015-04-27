var mongoose = require('mongoose');
var Question = require('../model/question');
var Ticket = require('../model/ticket');
var express = require('express');
var router = express.Router();

router.route('/')
  .get(function(req,res){
    Ticket.find().exec(function(err,docs){
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
      ticket.name = req.body.name;
      ticket.ticketType = req.body.ticketType;
      ticket.requiresPassword = req.body.ticketType.length > 0;
      ticket.password = req.body.ticketType;

      ticket.title = req.body.title;
      ticket.content = req.body.content;
      ticket.status = 'New';
      ticket.votes = req.body.votes;
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

router.route('/tickets/:id')
.put(function(req,res){
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
    res.json({message: 'You can only close tickets, not delete them.'});
});

module.exports = router;
