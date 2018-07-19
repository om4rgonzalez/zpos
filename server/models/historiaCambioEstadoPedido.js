const mongoose = require('mongoose');
let Schema = mongoose.Schema;
let historiaCambioEstadoPedidoSchema = new Schema({
    pedido: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pedido'
    },
    estadoAnterior: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estado'
    },
    nuevoEstado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Estado'
    },
    fechaAlta: {
        type: Date,
        default: Date.now
    }
});

// personaSchema.plugin(uniqueValidator, { message: 'El {PATH} ya esta registrado' });
module.exports = mongoose.model('HistoriaCambioEstadoPedido', historiaCambioEstadoPedidoSchema);