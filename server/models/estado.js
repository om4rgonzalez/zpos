const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;
let estadoSchema = new Schema({
    nombre: {
        type: String
    },
    precedencia: {
        type: Number
    }
});


module.exports = mongoose.model('Estado', estadoSchema);