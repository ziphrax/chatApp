var express = require('express');
var router = express.Router();
var comics = require('../model/marvel/comics');
var request = require('request');

router.route('/data/comics/')
	.get(function(req,res){
		comics.find(null,function(err,response,body){
			if(err){
				console.log(err)
			} else {
				res.json(JSON.parse(body));
			}
		});
	});

router.route('/data/comics/:id')
	.get(function(req,res){
		comics.find(req.params.id,function(err,response,body){
			if(err){
				console.log(err)
			} else {
				res.json(JSON.parse(body));
			}
		});
	});

router.route('/comics/')
	.get(function(req,res){
		comics.find(null,0,'',function(err,response,body){
			if(err){
				console.log(err)
			} else {
				res.render('pages/marvel/comics',{comics: JSON.parse(body),search: ''});
			}
		});
	});
router.route('/comics/offset/:offset')
	.get(function(req,res){
		comics.find(null,req.params.offset,'',function(err,response,body){
			if(err){
				console.log(err)
			} else {
				res.render('pages/marvel/comics',{comics: JSON.parse(body),search: ''});
			}
		});
	});
	router.route('/comics/offset/:offset/search/:search')
		.get(function(req,res){
			comics.find(null,req.params.offset,req.params.search,function(err,response,body,search){
				if(err){
					console.log(err)
				} else {
					res.render('pages/marvel/comics',{comics: JSON.parse(body),search:search?search:''});
				}
			});
		});
router.route('/comics/:id/')
	.get(function(req,res){
		comics.find(req.params.id,null,null,function(err,response,body){
			if(err){
				console.log(err)
			} else {
				res.render('pages/marvel/comic',{comics: JSON.parse(body),search: '' });
			}
		});
	});

module.exports = router
