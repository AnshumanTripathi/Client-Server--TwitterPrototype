var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var routes = require('./routes/index');
var home = require('./routes/home');
var ejs = require('ejs');


//URL for the sessions collections in mongoDB
var mongoSessionConnectURL = "mongodb://localhost:27017/twitter";
var expressSession = require("express-session");
var mongoStore = require("connect-mongo")(expressSession);
var mongo = require("./routes/mongo");

var app = express();

app.use(expressSession({
    secret: 'cmpe273_teststring',
    resave: false,  //don't save session if unmodified
    saveUninitialized: false,	// don't create session until something stored
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    store: new mongoStore({
        url: mongoSessionConnectURL
    })
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req,res){
  res.render("index");
});

app.get('/goToLogin',home.goToLogin);
app.get('/signup',function(req,res){
  res.render('signup');
});
app.get('/getTweets',home.getTweets);
app.get('/profile',function(req,res){
  res.render('myProfile');
});
app.get('/getProfile/:id',home.getProfile);
app.get('/getTweetsByUser',home.searchTweetByUser);
app.get('/editProfile',function(req,res){
  res.render('editProfile');
});
app.get('/signup',function(req,res){
  res.render('signup');
});


//POST
app.post('/logout',home.logout);
app.post('/signup',home.signUp);
app.post('/tweet',home.tweet);
app.post('/login',home.afterSignIn);
app.post('/getCurrentUser',home.getCurrentUser);
app.post('/search',home.search);
app.post('/searchTweet',home.searchTweet);
app.post('/follow',home.follows);
app.post('/editProfile',home.editProfile);
app.post('/getFollowers',home.getFollowers);
//app.post('/retweet',home.retweet);
app.post('/getMyTweet',home.getMyTweets);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });


}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



//connect to the mongo collection session and then createServer
mongo.connect(mongoSessionConnectURL, function(){
    console.log('Connected to mongo at: ' + mongoSessionConnectURL);
    http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
});
module.exports = app;