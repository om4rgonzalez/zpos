const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;
let estadoSchema = new Schema({
    nombre: {
        type: String
    }
});


module.exports = mongoose.model('Estado', estadoSchema);