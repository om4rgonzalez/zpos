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
    comercioPerteneceARedProveedor: {
        type: Boolean,
        default: false
    },
    tipoEntrega: {
        type: String,
        required: true
    },
    fechaEntrega: {
        type: String,
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
    },
    tipoCostoEntrega: {
        type: String,
        default: 'SIN COSTO'
    },
    costoEntrega: {
        type: Number,
        default: 0
    },
    montoTotalPedido: {
        type: Number,
        default: 0
    }
});


module.exports = mongoose.model('Pedido', pedidoSchema);