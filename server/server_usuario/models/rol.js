const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let rolSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    precedencia: {
        type: Number,
        required: true
    }

});

module.exports = mongoose.model('Rol', rolSchema);