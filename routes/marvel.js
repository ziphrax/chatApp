var express = require('express');
var router = express.Router();
var comics = require('../model/marvel/comics');
var request = require('request');

router.route('/comics/')
	.get(function(req,res){
		comics.find(null,function(err,response,body){
			if(err){
				console.log(err)
			} else {
				res.json(JSON.parse(body));
			}
		});
	});

router.route('/comics/:id')
	.get(function(req,res){
		comics.find(req.params.id,function(err,response,body){
			if(err){
				console.log(err)
			} else {
				res.json(JSON.parse(body));
			}
		});
	});

module.exports = router

