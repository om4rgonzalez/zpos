const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let sesionSchema = new Schema({
        fechaInicio: {
            type: Date,
            default: Date.now
        },
        fechaFin: {
            type: Date,
            default: Date.now
        },
        activa: {
            type: Boolean,
            default: true
        }
    }

)

module.exports = mongoose.model('Sesion', sesionSchema);