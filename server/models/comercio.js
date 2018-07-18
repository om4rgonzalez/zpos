const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let comercioSchema = new Schema({
        cuit: {
            type: String,
        },
        razonSocial: {
            type: String,
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


module.exports = mongoose.model('Comercio', comercioSchema);