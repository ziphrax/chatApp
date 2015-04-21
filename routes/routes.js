var basicAuth = require('basic-auth-connect');
var express = require('express');
var router = express.Router();

var auth = basicAuth('Admin42', 'Pro1337p4ss');
var dataRoutes = require('../routes/data');
var surveysRoute = require('../routes/surveys');


router.use('/data',dataRoutes);
router.use('/surveys',auth,surveysRoute);

router.route('/')
  .get(function(request,response){
    response.render('pages/index', { });
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
