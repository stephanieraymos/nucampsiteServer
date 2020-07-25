const mongoose = require('mongoose');
//This is making a shorthand to the mongoose.Schema function so we can refer to it as Schema:
const Schema = mongoose.Schema;

//Creating Schema:
const favoriteSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  campsites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campsite'
  }]
}, {
  timestamps: true //created at and updated at
});

//Creating Model: 
//First argument: Capitalized and singular version of the collection you want to use for this model; Campsite for campsites collection
//Second argument: Schema we want to use for this collection) 
//Returns a constructor function (A de-sugared class)
//Used to instantiate documents for mondoDB
const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;