var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Config Cognitive Application' });
});

router.post('/', function(req, res, next) {
  var user = {
       username : 'admin',
       password : 'admin123'
  }
  if(req.body.username===user.username && req.body.password===user.password){
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

module.exports = router;
