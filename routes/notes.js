var mongoose = require('mongoose');
var Question = require('../model/question');
var Note = require('../model/note');
var express = require('express');
var router = express.Router();

router.route('/')
  .get(function(req,res){    
    Note.find({owner:req.user.username}).exec(function(err,docs){
      if(err){
        res.status(500).send(err);
      } else {
        res.json(docs);
        res.end();
      }
    });
  }).post(function(req,res){
    var note = new Note();
    note.content = req.body.content;
    note.from = req.body.from;
    note.owner = req.user.username;
    note.time = new Date();
    note.tags = req.body.tags;

    note.save(function(err){
      if(err) {
        res.status(500).send(err);
      } else {
        res.json({message: 'Note saved successfully',data: note});
      }
    });
  });

router.route('/:id').put(function(req,res){
  Note.findOne({_id: req.params.id},function(err,note){
    if(err){
      return res.status(500).send(err);
    } else {
      for(pro in req.body){
        note[prop] = req.body[prop];
      }
      note.save(function(err){
          if(err){
            return res.send(err);
          } else {
            res.json({message: 'Note saved successfully',data:note});
          }
      });
    }
  });
}).get(function(req,res){
  Note.findOne({ _id: req.params.id}, function(err, note) {
   if (err) {
     return res.send(err);
   } else {
     res.json(note);
   }
 });
}).delete(function(req,res){
  Note.remove({
    _id: req.params.id
  },function(err,note){
    if(err){
      return res.send(err);
    } else {
      res.json({message: 'Successfully deleted'});
    }
  });
});

module.exports = router;
