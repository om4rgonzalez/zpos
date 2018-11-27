const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let plantillaSchema = new Schema({
        metodo: {
            type: String
        },
        titulo: {
            type: String
        },
        mensaje: {
            type: String
        },
        tipoError: {
            type: Number,
            default: 0
        },
        rolDestino: {
            type: Number,
            default: 1
        }
    }

)

module.exports = mongoose.model('Plantilla', plantillaSchema);