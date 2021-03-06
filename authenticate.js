const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const FacebookTokenStrategy = require('passport-facebook-token');

const config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate())); //Verifying the username and pass against the locally stored user and pass
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) { //received object that contains id for user doc
    return jwt.sign(user, config.secretKey, { expiresIn: 3600 }); //returning token. Sign method takes user object passed in as first arg, second arg is the secret key (in config.js.) 1 hr expiration.
};

const opts = {}; //contains options for jwt strategy, initialized as empty object.
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //Specifies how json web token should be extracted from the incoming req message. Asking the req is sent as a bearer token in an auth header. (Sending json web token.)
opts.secretOrKey = config.secretKey; //Supplies jwt strategy with key for token.

exports.jwtPassport = passport.use( //takes an instance of the jwt strategy as an argument
    new JwtStrategy( //constructor
        opts,
        (jwt_payload, done) => { //(options, verify) 
            console.log('JWT payload:', jwt_payload);
            User.findOne({ _id: jwt_payload._id }, (err, user) => { //checking for user doc with id that matches the token
                if (err) {
                    return done(err, false); //no user was found
                } else if (user) { //was user found?
                    return done(null, user); //no error, user doc as second arg. --> done is loading info from doc to the req object
                } else {
                    return done(null, false); //no error, but no user doc was found that matched what was in token
                }
            });
        }
    )
);

exports.verifyUser = passport.authenticate('jwt', { session: false }); //used to verify that incoming req is from authenticated user. session: false (not using sessions) --> Shortcut to use in other modules when authenicating with jwt strategy 
// exports.verifyAdmin = passport.authenticate('jwt', { session: false });
exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        return next();
    } else {
        err = new Error("You are not authorized to perform this operation!");
        err.status = 403;
        return next(err); //Passing off error to express error handling mechanism 
    }
};

exports.facebookPassport = passport.use(
    new FacebookTokenStrategy(
        {
            clientID: config.facebook.clientId, //appId from facebook
            clientSecret: config.facebook.clientSecret //app secret from facebook
        },
        (accessToken, refreshToken, profile, done) => {
            User.findOne({ facebookId: profile.id }, (err, user) => { //Checking if there's already a user with a fb id that matches profile.id
                if (err) {
                    return done(err, false);
                }
                if (!err && user) { //no error but user already exists in the database
                    return done(null, user); //no error + user document
                } else { //no error + no user
                    user = new User({ username: profile.displayName }); //create new user document
                    user.facebookId = profile.id;
                    user.firstname = profile.name.givenName;
                    user.lastname = profile.name.familyName;
                    user.save((err, user) => { //saving doc to mongoDB database
                        if (err) {
                            return done(err, false);
                        } else {
                            return done(null, user);
                        }
                    });
                }
            });
        }
    )
);