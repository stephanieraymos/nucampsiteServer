const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');

const promotionRouter = express.Router();
promotionRouter.use(bodyParser.json());

promotionRouter.route('/:promotionId')
    .get((req, res) => {
        res.end(`Will send details of the campsite: ${req.params.promotionId} to you`);
    })
    .post(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.promotionId}`);
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.write(`Updating the campsite: ${req.params.promotionId}\n`);
        res.end(`Will update the campsite: ${req.body.name} with description: ${req.body.description}`);
    })
    .delete(authenticate.verifyUser, (req, res) => {
        res.end(`Deleting promotion: ${req.params.promotionId}`);
    });

    // (/ is defining the route for promotions)
    promotionRouter.route('/')
    .get((req, res) => {
        res.end('Will send all the promotions to you');
    })
    .post(authenticate.verifyAdmin, (req, res) => {
        res.end(`Will add the promotion: ${req.body.name} with description: ${req.body.description}`);
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /promotions');
    })
    .delete(authenticate.verifyAdmin, (req, res) => {
        res.end('Deleting all promotions');
    });

module.exports = promotionRouter;