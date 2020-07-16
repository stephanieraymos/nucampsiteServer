var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { MONGO_URI } = require('./config')
const session = require('express-session');
const FileStore = require('session-file-store')(session);
//First class function. Require function is returning another function as it's return value. Then we're calling that returned function with the second parameter list of session.

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

const mongoose = require('mongoose');

//CONNECT TO MONGODB
mongoose.connect(MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.log(err));

const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'),
  err => console.log(err)
);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//DEPENDENCIES 
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345-67890-09876-54321'));
app.use(session({
  name: 'session-id', //Can be named anything
  secret: '12345-67890-09876-54321',
  saveUninitialized: false, //When a new session is created; but then no updates are made to it: then at the end of the req it won't get saved because it would just be an empty session + no cookie would be sent to the client. --> Helps prevent having a bunch of empty session files and cookies being set up.
  resave: false, //Once a session has been created, updated and saved; it will continue to be resaved whenever a req is made for that session; even if that req didn't make any updates. --> Helps keep the session marked as active so it doesn't get deleted. 
  store: new FileStore()
}));

function auth(req, res, next) {
  if (!req.signedCookies.user) { //signedCookies automatically parses a signed cookie from the request. Returns false if cookie is not properly signed. If incoming req doesn't include the signedCookies.user property or if signedCookie value is false --> client hasn't been authenticated.
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    //Grabbing the username and password out from the auth array:
    const user = auth[0];
    const pass = auth[1];
    if (user === 'admin' && pass === 'password') {
      res.cookie('user', 'admin', { signed: true }); //Creating new cookie with name 'user'. Second argument is a value to be stored in the name property ('admin')
      return next(); // authorized
    } else {
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }
  } else {
    if (req.signedCookies.user === 'admin') {
      return next();
    } else {
      const err = new Error('You are not authenticated!');
      err.status = 401;
      return next(err);
    }
  }
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

//ROUTERS
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
