const mongoose = require('mongoose');
//This is making a shorthand to the mongoose.Schema function so we can refer to it as Schema:
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose); //This will load the new currency type into mongoose so it's available to schemas
const Currency = mongoose.Types.Currency; //Shorthand for mongoose.Types.Currency

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
    type: mongoose.Schema.Types.ObjectId, //reference to a user doc through the user docs object id
    ref: 'User' //name of model for that doc
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
  image: {
      type: String,
      required: true
  },
  elevation: {
      type: Number,
      required: true
  },
  cost: {
      type: Currency,
      required: true,
      min: 0
  },
  featured: {
      type: Boolean,
      default: false
  },
  comments: [commentSchema]
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