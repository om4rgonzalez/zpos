const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let proveedorSchema = new Schema({
    nombre: {
        type: String,
        require: [true, 'Debe ingresar el nombre del producto']
    },
    cuit: {
        type: String
    },
    activo: {
        type: Boolean,
        default: true
    }
});

// personaSchema.plugin(uniqueValidator, { message: 'El {PATH} ya esta registrado' });
module.exports = mongoose.model('Proveedor', proveedorSchema);