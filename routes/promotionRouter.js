const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const promotionRouter = express.Router();
promotionRouter.use(bodyParser.json());

promotionRouter.route('/:promotionId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) //Handling preflight req. --> Any time a client needs to preflight a req: it will do so by sending a req with the http options method. Client will wait for server to respond with info on what kind of req it will accept to figure out whether or not it can send it's actual req.
    .get(cors.cors, (req, res) => {
        res.end(`Will send details of the campsite: ${req.params.promotionId} to you`);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.promotionId}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.write(`Updating the campsite: ${req.params.promotionId}\n`);
        res.end(`Will update the campsite: ${req.body.name} with description: ${req.body.description}`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.end(`Deleting promotion: ${req.params.promotionId}`);
    });

// (/ is defining the route for promotions)
promotionRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) //Handling preflight req. --> Any time a client needs to preflight a req: it will do so by sending a req with the http options method. Client will wait for server to respond with info on what kind of req it will accept to figure out whether or not it can send it's actual req.
    .get(cors.cors, (req, res) => {
        res.end('Will send all the promotions to you');
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.end(`Will add the promotion: ${req.body.name} with description: ${req.body.description}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /promotions');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.end('Deleting all promotions');
    });

module.exports = promotionRouter;