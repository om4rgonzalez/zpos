const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let aliasSchema = new Schema({
        esProveedor: {
            type: Boolean,
            default: false
        },
        comercio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comercio'
        },
        alias: {
            type: String,
            default: ''
        },
        fechaAlta: {
            type: Date,
            default: Date.now
        }
    }

);


module.exports = mongoose.model('Alias', aliasSchema);