const express = require('express');
const bodyParser = require('body-parser');
const Campsite = require('../models/campsite');

const campsiteRouter = express.Router();

campsiteRouter.use(bodyParser.json());

campsiteRouter.route('/')
.get((req, res, next) => { //next is for error handling
    Campsite.find()
    .then(campsites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsites); //Sending json data to the client. Automatically closes the response stream afterward; so no res.end is needed
    })
    .catch(err => next(err)); //next(err) is passing off the error to the overall error handler so express can handle it.
})
.post((req, res, next) => {
    Campsite.create(req.body) //Mongoose will let us know if we're missing any data in the request body
    .then(campsite => {
        console.log('Campsite Created ', campsite); //Second argument; campsite: will log info about the campsite to the console.
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite); //Sends info about posted document to the client. (No res.end needed)
    })
    .catch(err => next(err));
})
.put((req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /campsites');
})
.delete((req, res, next) => {
    Campsite.deleteMany() //Every document in campsite collection will be deleted
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

campsiteRouter.route('/:campsiteId')
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId) //this id is getting parsed from the http request; from whatever the user on client side typed in as the id they want to access
    .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
    })
    .catch(err => next(err));
})
.post((req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.put((req, res, next) => {
    Campsite.findByIdAndUpdate(req.params.campsiteId, {
        $set: req.body //update operator along with the data in the request body
    }, { new: true }) //this is so we get back info about the updated document resulting from this method
    .then(campsite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(campsite);
    })
    .catch(err => next(err));
})
.delete((req, res, next) => {
    Campsite.findByIdAndDelete(req.params.campsiteId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

campsiteRouter.route('/:campsiteId/comments')
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)//client is looking for a single campsite's comments; not all
    .then(campsite => {
        if (campsite) { //making sure non-null/truthy value was returned for the campsite document
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite.comments); //accessing and returning the comments for this campsite formatted in json
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`); 
            err.status = 404;
            return next(err); //Passing off error to express error handling mechanism 
        }
    })
    .catch(err => next(err));
})
.post((req, res, next) => { //This post request will be adding a new comment to the list of comments for a particular campsite
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite) { //making sure non-null/truthy value was returned for the campsite document
            campsite.comments.push(req.body); //pushing new comment into the comments array
            //This has only saved the comments array that's in the applications memory; not the comments sub document in the mongodb database
            campsite.save() //to save this change to the mongodb database (lowercase because it's not static: it's being performed on this particular campsite instance; the document itself)
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put((req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`); //echoing back to the client: the path that they tried to reach
})
.delete((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite) { //making sure non-null/truthy value was returned for the campsite document
            for (let i = (campsite.comments.length-1); i >= 0; i--) { //Looping through and removing every comment one at a time by its id
                campsite.comments.id(campsite.comments[i]._id).remove();
            }
            campsite.save()
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

campsiteRouter.route('/:campsiteId/comments/:commentId')
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) { //making sure non-null/truthy value was returned for the campsite document & for the comment
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsite.comments.id(req.params.commentId));
        } else if (!campsite) { //if campsite was not found
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        } else { //if comment was not found
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post((req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
})
.put((req, res, next) => { //this put request will update the text and rating fields of an existing comment
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) { //making sure non-null/truthy value was returned for the campsite document & for the comment
            if (req.body.rating) { //if a new comment rating has been passed in
                campsite.comments.id(req.params.commentId).rating = req.body.rating; //then we'll set the rating for the specified comment with that new rating
            }
            if (req.body.text) { //if a new comment text has been passed in
                campsite.comments.id(req.params.commentId).text = req.body.text; //then we'll set the text for the specified comment with that new text
            }
            campsite.save() //save updates to mongodb server
            .then(campsite => { //if save operation succeeds
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
        } else if (!campsite) {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.delete((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
            campsite.comments.id(req.params.commentId).remove(); //removing comment
            campsite.save()
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
        } else if (!campsite) {
            err = new Error(`Campsite ${req.params.campsiteId} not found`);
            err.status = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

module.exports = campsiteRouter;