const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let bandejaSalidaSchema = new Schema({
        mensaje: {
            type: String
        },
        titulo: {
            type: String
        },
        destino: {
            type: String
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        },
        fechaEnvio: {
            type: Date,
            default: Date.now
        },
        enviado: {
            type: Boolean,
            default: false
        },
        tipoEnvio: {
            type: String,
            default: 'PUSH'
        },
        destinos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contacto_Mensaje'
        }]
    }

)

module.exports = mongoose.model('BandejaSalida', bandejaSalidaSchema);