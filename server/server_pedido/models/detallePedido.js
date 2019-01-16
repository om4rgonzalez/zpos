const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let detallePedidoSchema = new Schema({

        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto'
        },
        producto_: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto_'
        },
        nombreProducto: {
            type: String
        },
        precioProveedor: {
            type: Number,
            default: 0
        },
        precioSugerido: {
            type: Number,
            default: 0
        },
        unidadMedida: {
            type: String
        },
        cantidadPedido: {
            type: Number,
            required: true
        },
        activo: {
            type: Boolean,
            default: true
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        }
    }

);


module.exports = mongoose.model('DetallePedido', detallePedidoSchema);