const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let loginSchema = new Schema({
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario'
        },
        idPush: {
            type: String
        },
        online: {
            type: Boolean,
            default: true
        },
        sesiones: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sesion'
        }]
    }

)

module.exports = mongoose.model('Login', loginSchema);