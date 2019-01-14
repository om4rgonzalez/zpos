const mongoose = require('mongoose');

//modelo deprecated

let Schema = mongoose.Schema;

let productoSchema = new Schema({

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
            type: Number
        },
        activo: {
            type: Boolean,
            default: true
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        },
        unidadesMedida: [{
            type: String
        }],
        categoria: {
            type: String
        },
        subcategoria: {
            type: String
        }
    }

);


module.exports = mongoose.model('Producto', productoSchema);