var express = require('express');
var router = express.Router();
var bluepages = require('bluepages');
var session = require('express-session');
var Conversation = require('watson-developer-cloud/conversation/v1');

var app = express();
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('query', { title: 'Config Cognitive Application', imageURL: req.session.imageURL});
});

router.get('/mfc', function(req, res, next) {
  res.render('query/mfc', { title: 'MFC Sourse Analyze' });
});

router.get('/sova', function(req, res, next) {
  res.render('query/sova', { title: 'SOVA Sourse Analyze' });
});

router.get('/bi', function(req, res, next) {
  res.render('query/bi', { title: 'BI Version Analyze' });
});

router.get('/watson', function(req, res, next) {
  res.render('query/watson', { title: 'Watson Rebot' });
});




module.exports = router;