const express = require('express');
const app = express();

const UnidadMedida = require('../models/unidadMedida');


app.post('/producto/inicializar_unidades_medida', function(req, res) {

    let valores = [{ nombre: 'UNIDAD' },
        { nombre: 'KILOGRAMO' },
        { nombre: 'DOCENA' },
        { nombre: 'FARDO' },
        { nombre: 'PACK' }
    ];

    let respuesta = [];
    for (var i = 0; i < valores.length; i++) {
        let item = new UnidadMedida({
            nombre: valores[i].nombre
        });



        item.save();
    }





})


module.exports = app;