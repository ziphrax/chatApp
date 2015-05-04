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
.post(function(req,res){
  if(req.user){
    var comment = new Comment();

    comment.content = req.body.content;
    comment.status = 'New';
    comment.created = new Date();
    comment.owner = req.user.username;
    comment.user = req.params.id;
    comment.updated = new Date();

    comment.save(function(err){
      if(err) {
        res.status(500).send(err);
      } else {
        res.json({message: 'Comment saved successfully',data: comment});
      }
    });
  } else {
    res.status(403).send("Request denied");
  }
}).get(function(req,res){
  Comment.find({ owner: req.params.id}, function(err, comments) {
   if (err) {
     return res.send(err);
   } else {
      res.json(comments);
   }
 });
}).delete(function(req,res){
  Comment.findOne({ owner: req.params.id}, function(err, comment) {
    if(req.user && req.user.username == comment.owner){
      comment.status = 'closed';
      comment.save(function(err){
        if(err) {
          res.status(500).send(err);
        } else {
          res.json({message: 'Comment deleted successfully',data: comment});
        }
      });
    }
  });    
});

module.exports = router;
