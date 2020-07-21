const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const partnerRouter = express.Router();
partnerRouter.use(bodyParser.json());

partnerRouter.route('/:partnerId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) //Handling preflight req. --> Any time a client needs to preflight a req: it will do so by sending a req with the http options method. Client will wait for server to respond with info on what kind of req it will accept to figure out whether or not it can send it's actual req.
    .get(cors.cors, (req, res) => {
        res.end(`Will send details of the partner: ${req.params.partnerId} to you`);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /partners/${req.params.partnerId}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.write(`Updating the partner: ${req.params.partnerId}\n`);
        res.end(`Will update the partner: ${req.body.name} with description: ${req.body.description}`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.end(`Deleting partner: ${req.params.partnerId}`);
    });

partnerRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) //Handling preflight req. --> Any time a client needs to preflight a req: it will do so by sending a req with the http options method. Client will wait for server to respond with info on what kind of req it will accept to figure out whether or not it can send it's actual req.
    .get(cors.cors, (req, res) => {
        res.end('Will send all the partners to you');
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.end(`Will add the campsite: ${req.body.name} with description: ${req.body.description}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /partners');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.end('Deleting all partners');
    });

module.exports = partnerRouter;