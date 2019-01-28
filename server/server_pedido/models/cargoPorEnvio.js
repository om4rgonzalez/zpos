const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let cargoPorEnvioSchema = new Schema({

        costoEnvio: {
            type: Number,
            default: 0
        }
    }

);


module.exports = mongoose.model('CargoPorEnvio', cargoPorEnvioSchema);