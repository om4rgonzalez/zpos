const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let comercioSchema = new Schema({

        entidad: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Entidad'
        },
        proveedores: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Proveedor'
        }],
        activo: {
            type: Boolean,
            default: true
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        },
        usuarios: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario'
        }]
    }

);


module.exports = mongoose.model('Comercio', comercioSchema);