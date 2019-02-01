const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let coberturaSchema = new Schema({

    nombreZona: {
        type: String,
        default: 'Zona'
    },
    provincias: [{
        provincia: String,
        localidades: [{
            localidad: String,
            barrios: [{
                barrio: String,
                costoEntrega: Number
            }]
        }]
    }]
});


module.exports = mongoose.model('Cobertura', coberturaSchema);