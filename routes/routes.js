var basicAuth = require('basic-auth-connect');
var express = require('express');
var router = express.Router();
var User = require('../model/user');
var passport = require('passport');
var auth = basicAuth('Admin42', 'Pro1337p4ss');
var dataRoutes = require('../routes/data');
var surveysRoute = require('../routes/surveys');

router.use('/data',dataRoutes);
router.use('/surveys',auth,surveysRoute);

router.route('/')
  .get(function(req,res){
    console.log(req.user);
    res.render('pages/index', { user : req.user});
  });

router.route('/register')
  .get(function(req, res) {
    res.render('pages/login/register', { });
}).post( function(req, res) {
    User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
        if (err) {
          return res.render("pages/login/register", {info: "Sorry. That username already exists. Try again."});
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

router.route('/login')
  .get(function(req, res) {
    res.render('pages/login/login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.route('/logout')
  .get(function(req, res) {
    req.logout();
    res.redirect('/');
});

router.route('/new-survey')
  .get(auth,function(request,response){
    response.render('pages/new-survey');
  });

router.route('/news')
  .get(function(request,response){
    response.render('pages/news');
  });

router.route('/notes')
  .get(function(request,response){
    response.render('pages/notes');
  });

router.route('/terms-of-service')
  .get(function(request,response){
    response.render('pages/terms');
  });

router.route('/users')
  .get(function(request,response){
    response.render('pages/users');
  });



module.exports = router;
