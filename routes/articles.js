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
  }).post(async function(req,res){
    if(req.user && req.user.username == 'admin42' ){
      var article = new Article();

      article.title = req.body.title;
      article.content = req.body.content;
      article.status = 'New';
      article.votes = 1;
      article.created = new Date();
      article.owner = req.user.username;
      article.updated = new Date();

      try {
        await article.save();
        res.json({message: 'Article saved successfully',data: article});
      } catch(err) {
        res.status(500).send(err);
      }
    } else {
      res.status(403).send("Request denied");
    }
  });

router.route('/summary/')
    .get(async function(req,res){
      try {
        const docs = await Article.find().sort({'updated':-1}).limit(5).exec();
        res.json(docs);
        res.end();
      } catch(err) {
        console.log(err);
        res.status(500).send(err);
      }
    });


router.route('/:id')
.post(async function(req,res){
  if(req.user && req.user.username == 'admin42' ){
    try {
      const article = await Article.findOne({_id: req.params.id});
      if(!article) {
        return res.status(404).send('Article not found');
      }

      if(req.user.username = article.owner){
        article.title = req.body.title;
        article.content = req.body.content;
      }

      article.status = req.body.status;
      article.votes = req.body.votes;
      article.updated = new Date();

      await article.save();
      res.json({message: 'Article updated successfully',data:article});
    } catch(err) {
      return res.status(500).send(err);
    }
  } else {
    res.status(403).send("Request denied");
  }
}).get(async function(req,res){
  try {
    const article = await Article.findOne({ _id: req.params.id});
    if(!article) {
      return res.status(404).send('Article not found');
    }
    res.json(article);
  } catch(err) {
    return res.status(500).send(err);
  }
}).delete(function(req,res){
    res.status(403).json({message: 'You can only close articles, not delete them.'});
});
module.exports = router;
