var mongoose = require('mongoose');
var Question = require('../model/question');
var Article = require('../model/article');
var express = require('express');
var router = express.Router();

router.route('/')
  .get(function(req,res){
    var query = Article.find({status:{'$ne': 'Closed'}});
     query.sort([['created',-1]]);
     query.exec(function(err, docs) {
      if(err){
        res.status(500).send(err);
      } else {
        res.json(docs);
        res.end();
      }
    });
  }).post(function(req,res){
    if(req.user && req.user.username == 'admin42' ){
      var article = new Article();

      article.title = req.body.title;
      article.content = req.body.content;
      article.status = 'New';
      article.votes = 1;
      article.created = new Date();
      article.owner = req.user.username;
      article.updated = new Date();

      article.save(function(err){
        if(err) {
          res.status(500).send(err);
        } else {
          res.json({message: 'Article saved successfully',data: article});
        }
      });
    } else {
      res.status(403).send("Request denied");
    }
  });

router.route('/:id')
.post(function(req,res){
  if(req.user && req.user.username == 'admin42' ){
    Article.findOne({_id: req.params.id},function(err,article){
      if(err){
        return res.status(500).send(err);
      } else {

        if(req.user.username = article.owner){
          article.title = req.body.title;
          article.content = req.body.content;
        }

        article.status = req.body.status;
        article.votes = req.body.votes;
        article.updated = new Date();

        article.save(function(err){
            if(err){
              return res.send(err);
            } else {
              res.json({message: 'Article updated successfully',data:article});
            }
        });
      }
    });
  } else {
    res.status(403).send("Request denied");
  }
}).get(function(req,res){
  Article.findOne({ _id: req.params.id}, function(err, article) {
   if (err) {
     return res.send(err);
   } else {
      res.json(article);
   }
 });
}).delete(function(req,res){
    res.status(403).json({message: 'You can only close articles, not delete them.'});
});

module.exports = router;
