var mongoose = require('mongoose');
var Comment = require('../model/comment');
var express = require('express');
var router = express.Router();

router.route('/').get(function(req,res){
  res.status(403).send("Request denied");
}).post(function(req,res){
  res.status(403).send("Request denied");
});

router.route('/:id')
.post(async function(req,res){
  if(req.user){
    var comment = new Comment();

    comment.content = req.body.content;
    comment.status = 'New';
    comment.created = new Date();
    comment.owner = req.user.username;
    comment.user = req.params.id;
    comment.updated = new Date();

    try {
      await comment.save();
      res.json({message: 'Comment saved successfully',data: comment});
    } catch(err) {
      res.status(500).send(err);
    }
  } else {
    res.status(403).send("Request denied");
  }
}).get(async function(req,res){
  try {
    const comments = await Comment.find({ owner: req.params.id});
    res.json(comments);
  } catch(err) {
    return res.status(500).send(err);
  }
}).delete(async function(req,res){
  try {
    const comment = await Comment.findOne({ owner: req.params.id});
    if(!comment) {
      return res.status(404).send('Comment not found');
    }
    if(req.user && req.user.username == comment.owner){
      comment.status = 'closed';
      await comment.save();
      res.json({message: 'Comment deleted successfully',data: comment});
    } else {
      res.status(403).send("Request denied");
    }
  } catch(err) {
    res.status(500).send(err);
  }
});

module.exports = router;
