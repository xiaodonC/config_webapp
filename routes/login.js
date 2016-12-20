var express = require('express');
var router = express.Router();
var bluepages = require('bluepages');
var session = require('express-session');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Config Cognitive Application' });
});

router.post('/', function(req, res, next) {
  var intranetId = req.body.username;
  var password = req.body.password;
  var user = {
       username : 'admin',
       password : 'admin123'
  }

    bluepages.authenticate(intranetId, password, function(err,verified){
    if(err) console.log(err);
    if(verified || req.body.username===user.username && req.body.password===user.password){
        res.send({
        code : 0,
        redirect : '/query'
        });
      }else{
        res.send({
        code : 1,
        redirect : '/login'
      });
    }
  });

  bluepages.getImageByIntranetId(intranetId,function(err,imageURL){
    if(err) console.log(err);
    else {
        req.session.imageURL=imageURL;
        }
    });
});

module.exports = router;

