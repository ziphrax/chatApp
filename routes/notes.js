var mongoose = require('mongoose');
var Question = require('../model/question');
var Note = require('../model/note');
var express = require('express');
var router = express.Router();

router.route('/')
  .get(async function(req,res){
    if(req.user){
      try {
        const docs = await Note.find({owner:req.user.username}).exec();
        res.json(docs);
        res.end();
      } catch(err) {
        res.status(500).send(err);
      }
    } else {
      res.status(403).send('Request denied');
    }
  }).post(async function(req,res){
    if(req.user){
      var note = new Note();
      note.content = req.body.content;
      note.from = req.body.from;
      note.owner = req.user.username;
      note.time = new Date();
      note.tags = req.body.tags;

      try {
        await note.save();
        res.json({message: 'Note saved successfully',data: note});
      } catch(err) {
        res.status(500).send(err);
      }
    } else {
      res.status(403).send("Request denied");
    }
  });

router.route('/:id').put(async function(req,res){
  if(req.user){
    try {
      const note = await Note.findOne({_id: req.params.id,owner: req.user.username});
      if(!note) {
        return res.status(404).send('Note not found');
      }
      
      for(prop in req.body){
        note[prop] = req.body[prop];
      }
      
      await note.save();
      res.json({message: 'Note saved successfully',data:note});
    } catch(err) {
      return res.status(500).send(err);
    }
  }else {
    res.status(403).send("Request denied");
  }
}).get(async function(req,res){
  if(req.user){
    try {
      const note = await Note.findOne({
        _id: req.params.id,
        owner: req.user.username
      });
      if(!note) {
        return res.status(404).send('Note not found');
      }
      res.json(note);
    } catch(err) {
      return res.status(500).send(err);
    }
  } else {
    res.status(403).send("Request denied");
  }
}).delete(function(req,res){
  if(req.user){
    Note.remove({
      _id: req.params.id,
      owner: req.user.username
    },function(err,note){
      if(err){
        return res.send(err);
      } else {
        res.json({message: 'Successfully deleted'});
      }
    });
  } else {
    res.status(403).send("Request denied");
  }
});

module.exports = router;
