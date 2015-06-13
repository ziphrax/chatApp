var express = require('express');
var router = express.Router();
var weapons = require('../model/miniGame/weapons');
var xenos = require('../model/miniGame/xenos');
var request = require('request');

//comics
	router.route('/data/weapons/')
		.get(function(req,res){
      weapons.find().exec(function(err,docs){
				if(err){
					console.log(err)
				} else {
					res.json(docs);
				}
			});
		});

	router.route('/data/weapons/:id')
		.get(function(req,res){
      xenos.findOne({_id: req.params.id},function(err,docs){
				if(err){
					console.log(err)
				} else {
					res.json(docs);
				}
			});
		});

	router.route('/weapons/')
		.get(function(req,res){
      weapons.find().exec(function(err,docs){
				if(err){
					console.log(err)
				} else {
					res.render('pages/miniGame/weapons',{weapons: docs});
				}
			});
		});
	router.route('/weapons/:id/')
		.get(function(req,res){
      weapons.findOne({_id: req.params.id},function(err,docs){
				if(err){
					console.log(err)
				} else {
					res.render('pages/miniGame/weapon',{weapons: docs});
				}
			});
		});


//characters
	router.route('/data/xenos/')
		.get(function(req,res){
      xenos.find().exec(function(err,docs){
				if(err){
					console.log(err)
				} else {
					res.json(docs);
				}
			});
		});

	router.route('/data/xenos/:id')
		.get(function(req,res){
      xenos.findOne({_id: req.params.id},function(err,docs){
				if(err){
					console.log(err)
				} else {
					res.json(docs);
				}
			});
		});

	router.route('/xenos/')
		.get(function(req,res){
      xenos.find().exec(function(err,docs){
				if(err){
					console.log(err)
				} else {
					res.render('pages/miniGame/xenos',{xenos: docs});
				}
			});
		});

	router.route('/xenos/:id/')
		.get(function(req,res){
      xenos.findOne({_id: req.params.id},function(err,docs){
				if(err){
					console.log(err)
				} else {
					res.render('pages/miniGame/xeno',{xenos: docs});
				}
			});
		});
module.exports = router
