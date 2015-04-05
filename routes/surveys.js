var mongoose = require('mongoose');
var Question = require('../model/question');
var Survey = require('../model/survey');
var express = require('express');
var router = express.Router();

router.route('/')
  .get(function(req,res){
    Survey.find().exec(function(err,docs){
      if(err){
        res.status(500).send(err);
      } else {
        res.json(docs);
        res.end();
      }
    });
  }).post(function(req,res){
    var survey = new Survey();
    survey.name = req.body.name;
    survey.surveyType = req.body.surveyType;
    survey.requiresPassword = req.body.surveyType.length > 0;
    survey.password = req.body.surveyType;

    survey.save(function(err){
      if(err) {
        res.status(500).send(err);
      } else {
        res.json({message: 'Survey saved successfully',data: survey});
      }
    });
  });
/*
router.route('/surveys/:id').put(function(req,res){
  Survey.findOne({_id: req.params.id},function(err,survey){
    if(err){
      return res.status(500).send(err);
    } else {
      for(pro in req.body){
        survey[prop] = req.body[prop];
      }
      survey.save(function(err){
          if(err){
            return res.send(err);
          } else {
            res.json({message: 'Survey saved successfully',data:survey});
          }
      });
    }
  });
}).get(function(req,res){
  Survey.findOne({ _id: req.params.id}, function(err, survey) {
   if (err) {
     return res.send(err);
   } else {
     res.json(survey);
   }
 });
}).delete(function(req,res){
  Survey.remove({
    _id: req.params.id
  },function(err,survey){
    if(err){
      return res.send(err);
    } else {
      res.json({message: 'Successfully deleted'});
    }
  });
});*/

module.exports = router;
