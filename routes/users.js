const express = require('express');
const User = require('../models/user');

const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

//USER SIGNUP
router.post('/signup', (req, res, next) => { //Allows new user to register on this website
  User.findOne({ username: req.body.username }) //Checking if username is already taken
    .then(user => {
      if (user) { //A user doc was found with a matching name
        const err = new Error(`Username ${req.body.username} already exists!`);
        err.status = 403; //Forbidden
        return next(err); //Passing to express to handle the error with the next function
      } else {
        User.create({
          username: req.body.username,
          password: req.body.password
          //Leaving admin out so clients can't make themselves admins (default value is false and it is not required)
        })
          .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ status: 'Woo-hoo! Registration Successful!', user: user });
          })
          .catch(err => next(err));
      }
    })
    .catch(err => next(err)); //if findOne returns a rejected promise
});

//USER LOGIN
router.post('/login', (req, res, next) => {
  if (!req.session.user) { //If user is not already logged in (If there's not a current session for this user)
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

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