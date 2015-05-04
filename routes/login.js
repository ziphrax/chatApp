var passport = require('passport');
var User = require('../model/user');

var express = require('express');
var router = express.Router();

router.route('/')
	.get( function(req, res) {
		return res.render('pages/login/index', { user : req.user });
	})
	.post(passport.authenticate('local',{
		successRedirect: '/login/success/',
		failureRedirect: '/login/failure/',
		failureFlash: false
	}));

router.route('/success')
	.get(function(req,res){
		return res.render('pages/login/success',{ user :  req.user.username });
	});

router.route('/failure')
	.get(function(req,res){
		return res.render('pages/login/failure', { failure : req.err});
	});

router.route('/register')
	.get(function(req, res) {
     	res.render('pages/login/register', { });
  	}).post(function(req, res) {
    	User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
        if (err) {
            return res.render('pages/login/register', { user : user, err : err });
        }
        passport.authenticate('local')(req, res, function () {
          return res.redirect('/');
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
