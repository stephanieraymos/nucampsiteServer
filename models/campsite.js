const mongoose = require('mongoose');
//This is making a shorthand to the mongoose.Schema function so we can refer to it as Schema:
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose) //This will load the new currency type into mongoose so it's available to schemas

const commentSchema = new Schema({
  //FIRST ARGUMENT:
  rating: {
    type: Number,
    min: 1, //min value
    max: 5, //max value
    required: true
  },
  text: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  }
}, {
    //SECOND ARGUMENT:
    timestamps: true
});

//Creating Schema:
const campsiteSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  comments: [commentSchema] //Addimg commentSchema as a sub document to the campsiteSchema
}, {
  timestamps: true //created at and updated at
});

//Creating Model: 
//First argument: Capitalized and singular version of the collection you want to use for this model; Campsite for campsites collection
//Second argument: Schema we want to use for this collection) 
//Returns a constructor function (A de-sugared class)
//Used to instantiate documents for mondoDB
const Campsite = mongoose.model('Campsite', campsiteSchema);

module.exports = Campsite;