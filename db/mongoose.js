const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(encodeURI(process.env.MONGO_URL))
  .then(function (db) {
    console.log('Connection established');
  })
  .catch(function(err){
    console.log('Error was thrown:', err);
  });

module.exports = { mongoose };