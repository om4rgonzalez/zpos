const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let unidadMedidaSchema = new Schema({
    nombre: {
        type: String
    }
});


module.exports = mongoose.model('UnidadMedida', unidadMedidaSchema);