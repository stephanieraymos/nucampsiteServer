const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Simple user schema
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    default: false
  }
});

//Creating and exporting the model in one line: 
module.exports = mongoose.model('User', userSchema);
//Collection will automatically be named "users"