const mongoose = require('mongoose');

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
        tipoEntrega: {
            type: String,
            required: true
        },
        fechaEntrega: {
            type: Date,
            required: true
        },
        detallePedido: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DetallePedido'
        }],
        activo: {
            type: Boolean,
            default: true
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        },
        estadoPedido: {
            type: String
        },
        estadoTerminal: {
            type: Boolean
        },
        comentario: {
            type: String
        },
        comentarioCancelado: {
            type: String,
            default: '-'
        },
        puntoVentaEntrega: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PuntoVenta'
        },
        fechaCambioEstado: {
            type: Date,
            default: Date.now
        }
    }

);


module.exports = mongoose.model('Pedido', pedidoSchema);