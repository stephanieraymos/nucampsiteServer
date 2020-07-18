const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');

const partnerRouter = express.Router();
partnerRouter.use(bodyParser.json());

partnerRouter.route('/:partnerId')
    .get((req, res) => {
        res.end(`Will send details of the partner: ${req.params.partnerId} to you`);
    })
    .post(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /partners/${req.params.partnerId}`);
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.write(`Updating the partner: ${req.params.partnerId}\n`);
        res.end(`Will update the partner: ${req.body.name} with description: ${req.body.description}`);
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.end(`Deleting partner: ${req.params.partnerId}`);
    });

    partnerRouter.route('/')
    .get((req, res) => {
        res.end('Will send all the partners to you');
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.end(`Will add the campsite: ${req.body.name} with description: ${req.body.description}`);
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /partners');
    })
    .delete(authenticate.verifyUser, (req, res) => {
        res.end('Deleting all partners');
    });

module.exports = partnerRouter;