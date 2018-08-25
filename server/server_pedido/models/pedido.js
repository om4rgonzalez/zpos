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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EstadoPedido'
        },
        comentario: {
            type: String
        },
        puntoVentaEntrega: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PuntoVenta'
        }
    }

);


module.exports = mongoose.model('Pedido', pedidoSchema);