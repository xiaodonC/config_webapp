var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var Conversation = require('watson-developer-cloud/conversation/v1'); 
var watson  = require('watson-developer-cloud');
var qs = require('qs');

var index = require('./routes/index');
var login = require('./routes/login');
var users = require('./routes/users');
var query = require('./routes/query');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'recommand 128 bytes random string', // 建议使用 128 个字符的随机字符串
  cookie: { maxAge: 60 * 1000 }
}));



app.use('/', login);
app.use('/login', login);
app.use('/query', query);
app.use('/index', index);

var conversation = new Conversation({
  // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  // Alex's app username and password
  username: '0d4757c3-1fb8-4689-af55-43f1bde3e96b',
  password: 'GQVkxJ8lvl6B',
  // xd's app username and password
  // username: 'b495f5b4-95fd-4460-bb40-b3fde3b38ea2',
  // password: 'wVPH0P1NyVS5',
  url: 'https://gateway.watsonplatform.net/conversation/api',
  version_date: '2016-10-21',
  version: 'v1'
});

var retrieve_and_rank = watson.retrieve_and_rank({
  username: '2519c67c-f8fa-4b70-8835-b9ed535f30c7',
  password: 'eAFAFmWeQbXm',
  version: 'v1'
});

app.post('/sova/rank', function(req, res, next) {
  var params = {
      cluster_id: 'sc6c171d6a_f063_4647_8e22_85cf541d6471',
      collection_name: 'first-try-connection'
    };
    solrClient = retrieve_and_rank.createSolrClient(params);

    var ranker_id = '1eec7cx29-rank-397';
    var question  = req.body.text;
    var query     = qs.stringify({q: question, ranker_id: ranker_id, fl: 'id,body'});

    solrClient.get('fcselect', query, function(err, searchResponse) {
      if(err) {
        console.log('Error searching for documents: ' + err);
      }
        else {
          // console.log(JSON.stringify(searchResponse.response.docs, null, 5));
          return res.json(searchResponse.response.docs);
        }
    });
});

// Endpoint to be call from the client side
app.post('/api/message', function(req, res) {
  // Alex's workspace id
  var workspace = '5415cf3e-46d2-47c1-baba-f7b62edca858';
  // xd's workspace id
  // var workspace = '07660246-fecc-443d-a16f-ee1b20d0048b';
  // var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }
  var payload = {
    workspace_id: workspace,
    context: req.body.context || {},
    input: req.body.input || {}
  };

  // Send the input to the conversation service
  conversation.message(payload, function(err, data) {
    if (err) {
      return res.status(err.code || 500).json(err);
    }
    return res.json(updateMessage(payload, data));
  });

});


function updateMessage(input, response) {
  var responseText = null;
  if (!response.output) {
    response.output = {};
  } else {
    return response;
  }
  if (response.intents && response.intents[0]) {
    var intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent . In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
    if (intent.confidence >= 0.75) {
      responseText = 'I understood your intent was ' + intent.intent;
    } else if (intent.confidence >= 0.5) {
      responseText = 'I think your intent was ' + intent.intent;
    } else {
      responseText = 'I did not understand your intent';
    }
  }
  response.output.text = responseText;
  return response;
}



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
