const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let proveedorSchema = new Schema({

        entidad: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Entidad'
        },
        puntosVenta: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PuntoVenta'
        }],
        productos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto'
        }],
        tiposEntrega: [{
            type: String,
            required: true
        }],
        usuarios: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario'
        }],
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


module.exports = mongoose.model('Proveedor', proveedorSchema);