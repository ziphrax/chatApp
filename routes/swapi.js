var express = require('express');
var router = express.Router();
var people = require('../model/swapi/people');
var request = require('axios');

//people
	router.route('/data/people/')
		.get(function(req,res){
			people.find(null,function(err,response,body){
				if(err){
					console.log(err)
				} else {
					res.json(JSON.parse(body));
				}
			});
		});

	router.route('/data/people/:id')
		.get(function(req,res){
			people.find(req.params.id,function(err,response,body){
				if(err){
					console.log(err)
				} else {					
					res.json(JSON.parse(body));
				}
			});
		});

	router.route('/people/')
		.get(function(req,res){
			people.find(req.params.id,function(err,response,body){
				if(err){
					console.log(err)
				} else {
					res.render('pages/swapi/people',{people: JSON.parse(body)});
				}
			});
		});

	router.route('/people/:id')
		.get(function(req,res){
			people.find(req.params.id,function(err,response,body){
				if(err){
					console.log(err)
				} else {
					res.render('pages/swapi/people',{people: JSON.parse(body)});
				}
			});
		});

module.exports = router