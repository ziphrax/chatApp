var passport = require('passport');
var User = require('../model/user');

var express = require('express');
var router = express.Router();

router.route('/')
	.get( function(req, res) {
		console.log('/GET');
		return res.render('pages/login/index', { user : req.user });
	})
	.post(passport.authenticate('local',{
		successRedirect: '/login/success/',
		failureRedirect: '/login/failure/',
		failureFlash: true 
	}));

router.route('/success')
	.get(function(req,res){
		return res.render('pages/login/success')
	});

router.route('/failure')
	.get(function(req,res){
		return res.render('pages/login/failure')
	});

router.route('/register')
	.get(function(req, res) {
		console.log('/GET register ');
      res.render('pages/login/register', { });
  	}).post(function(req, res) {
  		console.log('/register POST  ');
    	User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
        if (err) {
            return res.render('pages/login/register', { user : user, err : err });
        }
        console.log('/Authenticate redirect to / ');
        passport.authenticate('local')(req, res, function () {
          res.redirect('/');
        });
    });
  });

router.route('/logout')
	.get( function(req, res) {
		req.logout();
		console.log('/logged out redirect to / ');
		res.redirect('/');
	});

module.exports = router;