const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let pedidoSchema = new Schema({
    proveedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedor'
    },
    comercio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comercio'
    },
    detallePedido: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DetallePedido'
    }],
    fechaAlta: {
        type: Date,
        default: Date.now
    },
    estado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estado'
    }
});

// personaSchema.plugin(uniqueValidator, { message: 'El {PATH} ya esta registrado' });
module.exports = mongoose.model('Pedido', pedidoSchema);