var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const { MONGO_URI } = require('./config')
const passport = require('passport');
const config = require('./config');


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

const url = config.mongoUrl;

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
  saveUninitialized: false, //--> Helps prevent having a bunch of empty session files and cookies being set up. --When a new session is created; but then no updates are made to it: then at the end of the req it won't get saved because it would just be an empty session + no cookie would be sent to the client.
  resave: false, //--> Helps keep the session marked as active so it doesn't get deleted. --Once a session has been created, updated and saved; it will continue to be resaved whenever a req is made for that session; even if that req didn't make any updates. 
  store: new FileStore() //Saves session to server's hard disk instead of just in running app memory. 
}));

app.use(passport.initialize());
app.use(passport.session());

//ROUTES 
app.use('/', indexRouter);
app.use('/users', usersRouter);

function auth(req, res, next) {
  console.log(req.user);

  if (!req.user) { //If incoming req doesn't include the session.user property or if session value is false --> client hasn't been authenticated.
    const err = new Error('You are not authenticated!');
    err.status = 401;
    return next(err);
  } else {
    return next();
  }
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

//ROUTERS

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
