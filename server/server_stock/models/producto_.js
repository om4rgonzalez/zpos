const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let productoSchema = new Schema({

        codigoProveedor: {
            type: String
        },
        nombreProducto: {
            type: String,
            required: true
        },
        precioProveedor: {
            type: Number,
            required: true,
            default: 0
        },
        precioSugerido: {
            type: Number,
            default: 0
        },
        activo: {
            type: Boolean,
            default: true
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        },
        unidadMedida: {
            type: String,
            required: true
        },
        categoria: {
            type: String,
            default: 'GENERAL'
        },
        subcategoria: {
            type: String,
            default: 'GENERAL'
        },
        imagenes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Imagen_Producto'
        }],
        videos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video_Producto'
        }],
        stock: {
            type: Number,
            defaul: 10000000
        },
        historialPrecioProveedor: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Historia_Cambio_Precio_Proveedor'
        }],
        historiaPrecioSugerido: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Historia_Cambio_Precio_Sugerido'
        }]
    }

);


module.exports = mongoose.model('Producto_', productoSchema);