var basicAuth = require('basic-auth-connect');
var express = require('express');
var router = express.Router();
var User = require('../model/user');
var Ticket = require('../model/ticket');
var Article = require('../model/article');
var passport = require('passport');
var auth = basicAuth('Admin42', 'Pro1337p4ss');
var dataRoutes = require('../routes/data');
var surveysRoute = require('../routes/surveys');
var marked = require('marked');


router.use('/data',dataRoutes);
router.use('/surveys',auth,surveysRoute);

router.route('/')
  .get(function(req,res){
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

router.route('/user')
  .get(function(req,res){
    res.render('pages/user', { user : req.user , message: '' });
  })
  .post(function(req,res){
    if(req.user){
      User.findOne({username:req.user.username} , function(err,doc){
         if (err) {
            return res.status(500).send("There was an error updating the user")
          }
          doc.firstname = req.body.firstname;
          doc.lastname = req.body.lastname;
          doc.emailaddress = req.body.emailaddress;
          doc.save();
          return res.render( 'pages/user', { user : doc, message : "Update Successful"});
      });
    } else {
      res.status(403).send('Request denied');
    }
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

router.route('/tickets/:id')
  .get(function(req,res){
    Ticket.findOne({_id: req.params.id},function(err,ticket){
      if(err){        
        return res.status(500).send(err);
      } else {
        if(!req.user || ( req.user && req.user.username != 'admin42')){
          ticket.content = marked(ticket.content);
        }
        res.render('pages/ticket',{user: req.user, ticket: ticket});
      }
    });
});

router.route('/tickets')
  .get(function(req,res){
    res.render('pages/tickets', { user: req.user });
  });

router.route('/articles/:id')
  .get(function(req,res){
    Article.findOne({_id: req.params.id},function(err,article){
      if(err){
        return res.status(500).send(err);
      } else {
        if(!req.user || ( req.user && req.user.username != 'admin42')){
          article.content = marked(article.content);
        }
        res.render('pages/article',{user: req.user, article: article});
      }
    });
});

router.route('/articles')
  .get(function(req,res){
    res.render('pages/articles', { user: req.user });
  });



module.exports = router;
