const express = require('express');
const authenticate = require('../authenticate'); //authenticate module
const multer = require('multer');
const cors = require('./cors');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images'); //second arg is the path we want to save the file to
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname) //originalname will make sure the name of the file on the server will be the same as the name of the file on the client side --> If this is not set; multer gives a random string as the name by default.
  }
});

const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) { //reg ex expression to look for extentions --> Will check to see if the file extention is NOT one of these
    return cb(new Error('You can upload only image files!'), false); //false tells multer to reject this file upload
  }
  cb(null, true); //no error --> multer accepts the file (true)
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter }); // Now the multer module is configured to enable image file uplaods

const uploadRouter = express.Router();

//HTTP REQUESTS --> ONLY ALLOWING POST REQUESTS
uploadRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) //Handling preflight req. --> Any time a client needs to preflight a req: it will do so by sending a req with the http options method. Client will wait for server to respond with info on what kind of req it will accept to figure out whether or not it can send it's actual req.
  .get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => { //Expecting a single upload of a file whose input fields name is imageFile
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    //Multer adds an object to the request object named file. The file object will contain a bunch of additional info abou the file. --> 
    res.json(req.file); //Will confirm to the client that the files has been received correctly
    //Multer adds an object to the request object named file. The file object will contain a bunch of additional info abou the file.
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
  });

module.exports = uploadRouter;