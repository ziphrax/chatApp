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
	router.route('/weapons/:id')
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
		}).post(function(req,res){
	      var xeno = new xenos();

				xeno.title = req.body.title;
				xeno.description = req.body.description;
				xeno.faction = req.body.faction;
				xeno.strength = req.body.strength;
				xeno.toughness = req.body.toughness;
				xeno.level = req.body.level;

				xeno.save(function(err){
	        if(err) {
	          res.status(500).send(err);
	        } else {
						res.redirect('/minigame/xenos/' + xeno._id);
	        }
	      });
	  });

	router.route('/xenos/:id')
		.get(function(req,res){
      xenos.findOne({_id: req.params.id},function(err,docs){
				if(err){
					console.log(err)
				} else {
					res.render('pages/miniGame/xeno',{xeno: docs});
				}
			});
		}).post(function(req,res){
			xenos.findOne({_id: req.params.id},function(err,doc){
				if(err){
					console.log(err)
				} else {

					doc.title = req.body.title;
					doc.description = req.body.description;
					doc.faction = req.body.faction;
					doc.strength = req.body.strength;
					doc.toughness = req.body.toughness;
					doc.level = req.body.level;

					doc.save(function(err){
						if(err) {
							res.status(500).send(err);
						} else {
							res.redirect('/minigame/xenos/' + doc._id);
						}
					});
				}
			});
	  });
module.exports = router
