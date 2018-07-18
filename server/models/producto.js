const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let productoSchema = new Schema({
    nombre: {
        type: String,
        require: [true, 'Debe ingresar el nombre del producto']
    },
    precioUnitario: {
        type: Number
    },
    proveedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedor'
    },
    medidasAceptadas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UnidadMedida'
    }],
    activo: {
        type: Boolean
    }
});

// personaSchema.plugin(uniqueValidator, { message: 'El {PATH} ya esta registrado' });
module.exports = mongoose.model('Producto', productoSchema);