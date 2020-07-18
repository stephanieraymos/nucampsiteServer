const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');

const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

//USER SIGNUP
router.post('/signup', (req, res) => { //Allows new user to register on this website 
  User.register(new User({ username: req.body.username }), //New user with name provided by client
    req.body.password, (err, user) => { //password provided by client
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json'); //Letting client know to expect a json response
        res.json({ err: err }); //provides info about error
      } else {
        if (req.body.firstname) {
          user.firstname = req.body.firstname; //setting user first name 
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname; //setting user last name
        }
        user.save(err => { //saving to database
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: 'Registration Successful!' });
          });
        });
      }
    });
});

router.post('/login', passport.authenticate('local'), (req, res) => { //It's possible to insert multiple middleware functions in a routing method.
  const token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'You are successfully logged in!' });
});


//USER LOGOUT
router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy(); //destroying session: deleting session file on server side
    res.clearCookie('session-id');//Clearing cookie stored on client
    res.redirect('/');//Redirecting user to root path
  } else { //If session doesn't exist (Client is requesting to logout without being logged in)
    const err = new Error('You are not logged in!');
    err.status = 401;
    return next(err);
  }
});

//passport.authenticate handles challenging user for credentials, parsing the credentials from the req body ect.
module.exports = router;