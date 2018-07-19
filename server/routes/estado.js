const express = require('express');
const app = express();

const Estado = require('../models/estado');


app.post('/conf/inicializar_estados', function(req, res) {


    let valores = [
        { nombre: 'SIN ESTADO', precedencia: 0 },
        { nombre: 'PEDIDO INFORMADO', precedencia: 1 },
        { nombre: 'EN ANALISIS', precedencia: 2 },
        { nombre: 'ACEPTADO', precedencia: 3 },
        { nombre: 'RECHAZADO', precedencia: 3 },
        { nombre: 'ACEPTADO PARCIALMENTE', precedencia: 3 },
        { nombre: 'EN CAMINO', precedencia: 4 },
        { nombre: 'ENTREGADO', precedencia: 5 },
        { nombre: 'ENTREGADO PARCIALMENTE', precedencia: 5 },
        { nombre: 'VISITADO', precedencia: 5 },
        { nombre: 'EN PROCESO DE DEVOLUCION', precedencia: 5 },
        { nombre: 'NO ENTREGADO', precedencia: 6 }
    ];

    let respuesta = [];
    for (var i = 0; i < valores.length; i++) {
        let item = new Estado({
            nombre: valores[i].nombre,
            precedencia: valores[i].precedencia
        });



        item.save();
    }
})





module.exports = app;