const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let contactoMensajeSchema = new Schema({
        contacto: {
            type: String
        },
        tipoContacto: {
            type: String,
            default: 'PUSH'
        }
    }

)

module.exports = mongoose.model('Contacto_Mensaje', contactoMensajeSchema);