const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let clienteSchema = new Schema({
        titular: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Persona'
        },
        contactos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contacto'
        }],
        // tipoCliente: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     require: [true, 'Todo cliente debe pertenecer a un tipo'],
        //     ref: 'TipoCliente'
        // },
        estado: {
            type: Boolean,
            default: true
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        },
        idCliente: {
            type: String
        },
        plataforma: {
            type: String
        }
    }

);


module.exports = mongoose.model('Cliente', clienteSchema);