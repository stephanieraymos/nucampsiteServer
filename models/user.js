const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

//Simple user schema
const userSchema = new Schema({
  firstname: { 
      type: String,
      default: ''
  },
  lastname: {
  type: String,
      default: ''
  },
  facebookId: String,
  admin: {
      type: Boolean,
      default: false
  }
});

userSchema.plugin(passportLocalMongoose); //This plugin will handle adding the username and password fields to the doc + salting and hashing

//Creating and exporting the model in one line: 
module.exports = mongoose.model('User', userSchema);
//Collection will automatically be named "users"