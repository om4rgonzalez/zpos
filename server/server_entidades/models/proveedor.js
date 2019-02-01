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
            type: String
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
        },
        red: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Alias"
        }],
        contactos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contacto'
        }],
        proveedores: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Proveedor'
        }],
        productos_: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto_'
        }],
        cargoConfiguracion: {
            type: Boolean,
            default: false
        },
        imagenes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Imagen_Proveedor'
        }],
        videos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video_Proveedor'
        }],
        cobertura: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cobertura'
        }]
    }

);

module.exports = mongoose.model('Proveedor', proveedorSchema);