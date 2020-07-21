//CONFIGURING CORS MODULE: 
const cors = require('cors');

const whitelist = ['http://localhost:3000', 'https://localhost:3443']; //whitelist = array of string values
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header('Origin'));
    if(whitelist.indexOf(req.header('Origin')) !== -1) { //Checking whitelist array for index of req header. --> Checking if origin can be found in the whitelist. If index of method is not -1: it was found. Origin true allows req to be accepted
        corsOptions = { origin: true };
    } else { //if not found
        corsOptions = { origin: false };
    }
    callback(null, corsOptions); //no error has occured
};

exports.cors = cors(); //When we call cors it will return a middleware func configured to set a cors header of access-control-allow-origin on a response object with a wildcard as it's value: will alow CORS for all origins
exports.corsWithOptions = cors(corsOptionsDelegate); //Checking if incoming req belongs to one of the whitelisted origins in the array above. 
// If it does: will send back cors response header access-control-allow-origin with whitelist origin as the value. 
// If it doesn't it wont include the cors header in the response. 
//If there's a rest API endpoint where we only want to accept cross origin requests from one of these whitelisted origins: we will apply this middleware to that endpoint. 
// For the endpoints where we want to accept ALL cross origin requests: we will use the other one.