const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

exports.local = passport.use(new LocalStrategy(User.authenticate())); //Verifying the username and pass against the locally stored user and pass
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());