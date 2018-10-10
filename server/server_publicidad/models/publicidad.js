const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let publicidadSchema = new Schema({
    proveedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedor'
    },
    tieneImagen: {
        type: Boolean,
        default: false
    },
    imagen: {
        type: String
    },
    cuerpo: {
        type: String
    },
    fechaInicio: {
        type: Date,
        default: Date.now
    },
    fechaFin: {
        type: Date,
        default: Date.now
    },
    disponibilidad: {
        type: String,
        default: 'TODA LA RED'
    }

});

module.exports = mongoose.model('Publicidad', publicidadSchema);