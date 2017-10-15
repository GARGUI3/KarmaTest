var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var SearchSchema = new Schema({
  identificador: String,
  tipo: String,
  inicio: Date,
  termino: Date,
  estado: String
});

module.exports = mongoose.model('busquedas', SearchSchema);
