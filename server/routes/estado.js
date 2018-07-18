const express = require('express');
const app = express();

const Estado = require('../models/estado');


app.post('/conf/inicializar_estados', function(req, res) {
    //KG: 5b4d6a76bcc15c21246e24a1
    //UNIDAD: 5b4d6a76bcc15c21246e24a0
    //DOCENA: 5b4d6a76bcc15c21246e24a2
    //PACK: 5b4d6a76bcc15c21246e24a4

    let valores = [{ nombre: 'PEDIDO INFORMADO' },
        { nombre: 'EN ANALISIS' },
        { nombre: 'ACEPTADO' },
        { nombre: 'RECHAZADO' },
        { nombre: 'ACEPTADO PARCIALMENTE' },
        { nombre: 'EN CAMINO' },
        { nombre: 'ENTREGADO' },
        { nombre: 'ENTREGADO PARCIALMENTE' },
        { nombre: 'VISITADO' },
        { nombre: 'EN PROCESO DE DEVOLUCION' },
        { nombre: 'NO ENTREGADO' }
    ];

    let respuesta = [];
    for (var i = 0; i < valores.length; i++) {
        let item = new Estado({
            nombre: valores[i].nombre

        });



        item.save();
    }
})





module.exports = app;