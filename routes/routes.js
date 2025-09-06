var basicAuth = require('basic-auth-connect');
var express = require('express');
var router = express.Router();
var User = require('../model/user');
var Ticket = require('../model/ticket');
var Article = require('../model/article');
var Comment = require('../model/comment');
var passport = require('passport');
var auth = basicAuth('Admin42', 'Pro1337p4ss');
var dataRoutes = require('../routes/data');
var surveysRoute = require('../routes/surveys');
//var marvelRoute = require('../routes/marvel');
var swapiRoute = require('../routes/swapi');
var marked = require('marked');
var sanitizer = require('sanitizer');
var miniGameRoute = require('../routes/miniGame');
var monitorRoute = require('../routes/monitor');

router.use('/data',dataRoutes);
router.use('/surveys',auth,surveysRoute);
//router.use('/marvel',marvelRoute);
router.use('/swapi',swapiRoute);
router.use('/minigame',miniGameRoute);
router.use('/monitoring',monitorRoute);

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
    req.logout(function(err) {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/');
    });
  });router.route('/user')
  .get(function(req,res){
    res.render('pages/user', { user : req.user , message: '' });
  })
  .post(async function(req,res){
    if(req.user){
      try {
        const doc = await User.findOne({username:req.user.username});
        if (!doc) {
          return res.status(404).send("User not found");
        }

        doc.firstname = req.body.firstname;
        doc.lastname = req.body.lastname;
        doc.emailaddress = req.body.emailaddress;

        var url = sanitizer.sanitize(req.body.avatarURL);
        doc.avatarURL = url;
        doc.avatarIMG = parseImageURLS(url).msg;

        await doc.save();
        return res.render( 'pages/user', { user : doc, message : "Update Successful"});
      } catch(err) {
        return res.status(500).send("There was an error updating the user");
      }
    } else {
      res.status(403).send('Request denied');
    }
  });

router.route('/user/:id')
  .get(async function(req,res){
    try {
      const doc = await User.findOne({username:req.params.id});
      if(!doc) {
        return res.status(404).send("User not found");
      }
      doc.salt = '';
      doc.hash = '';
      if(req.user){
        doc.viewedas = req.user.username;
      } else {
        doc.viewedas = '';
      }
      
      const comments = await Comment.find({user:req.params.id});

      for(var i=0; i<comments.length; i++){
        if(comments[i].content){
          comments[i].content = marked(comments[i].content);
        }
      }
      res.render('pages/user', { user: doc , message: '' , comments: comments});
    } catch(err) {
      return res.status(500).send("There was an error getting the user or comments");
    }
  }).post(async function(req,res){
    if(req.user && req.user.username == req.params.id){
      try {
        const doc = await User.findOne({username:req.user.username});
        if (!doc) {
          return res.status(404).send("User not found");
        }

        doc.firstname = req.body.firstname;
        doc.lastname = req.body.lastname;
        doc.emailaddress = req.body.emailaddress;
        doc.interests = req.body.interests;
        doc.preferedVoice = req.body.preferedVoice;

        console.log(req.body.interests);

        var url = sanitizer.sanitize(req.body.avatarURL);
        doc.avatarURL = url;
        doc.avatarIMG = parseImageURLS(url).msg;

        await doc.save();
        res.redirect('../user/' + req.user.username);
      } catch(err) {
        return res.status(500).send("There was an error updating the user");
      }
    } else {
      res.status(403).send('Request denied');
    }
  });

router.route('/new-survey')
  .get(auth,function(request,response){
    response.render('pages/new-survey');
  });

router.route('/archived-news')
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
  .get(async function(req,res){
    try {
      const ticket = await Ticket.findOne({_id: req.params.id});
      if(!ticket) {
        return res.status(404).send('Ticket not found');
      }
      if(!req.user || ( req.user && req.user.username != 'admin42')){
        ticket.content = marked(ticket.content);
      }
      res.render('pages/ticket',{user: req.user, ticket: ticket});
    } catch(err) {
      return res.status(500).send(err);
    }
});

router.route('/tickets')
  .get(function(req,res){
    res.render('pages/tickets', { user: req.user });
  });

router.route('/articles/:id')
  .get(async function(req,res){
    try {
      const article = await Article.findOne({_id: req.params.id});
      if(!article) {
        return res.status(404).send('Article not found');
      }
      if(!req.user || ( req.user && req.user.username != 'admin42')){
        article.content = marked(article.content);
      }
      res.render('pages/article',{user: req.user, article: article});
    } catch(err) {
      return res.status(500).send(err);
    }
});

router.route('/articles')
  .get(function(req,res){
    res.render('pages/articles', { user: req.user });
  });

  function parseImageURLS(data){
      data = data.replace(re,'');
      var re = /\bhttps?:[^)''"]+\.(?:jpg|jpeg|gif|png)/ig;
      var img_matches = data.match(re);
      var msg = '';
      if(img_matches && img_matches.length > 0){
          for(var i = 0; i< img_matches.length;i++){
              msg += "<br /><img class='img-rounded' src='" + img_matches[i] +"' width='90'/>";
          }
      }

      return {msg: msg};
  }



module.exports = router;
