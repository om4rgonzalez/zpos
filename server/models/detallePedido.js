const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;
let detallePedidoSchema = new Schema({
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto'
    },
    unidadMedida: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UnidadMedida'
    },
    cantidad: {
        type: Number
    }

});


module.exports = mongoose.model('DetallePedido', detallePedidoSchema);