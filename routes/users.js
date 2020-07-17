const express = require('express');
const User = require('../models/user');
const passport = require('passport');

const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

//USER SIGNUP
router.post('/signup', (req, res) => { //Allows new user to register on this website
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    err => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      } else {
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, status: 'Registration Successful!' });
        });
      }
    }
  );
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, status: 'You are successfully logged in!' });
});


//HANDLE USER LOGIN
const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
const username = auth[0];
const password = auth[1];

User.findOne({ username: username }) //Checking inputted username against the user docs that we have in our database --> If found; can successfully authenticate the user and log them in
  .then(user => {
    if (!user) { //If inputted username doesn't exist
      const err = new Error(`User ${username} does not exist!`);
      err.status = 401;
      return next(err);
    } else if (user.password !== password) { //If inputted password doesn't match the docs in our database
      const err = new Error('Your password is incorrect!');
      err.status = 401;
      return next(err);
    } else if (user.username === username && user.password === password) { //Both username and password are correct: 
      req.session.user = 'authenticated';
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('You are authenticated!')
    }
  })
  .catch(err => next(err));
  } else {//Client is already logged in 
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('You are already authenticated!');
}
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

module.exports = router;