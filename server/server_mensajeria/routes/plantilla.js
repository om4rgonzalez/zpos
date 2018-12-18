const express = require('express');
const app = express();
const Plantilla = require('../models/plantilla');

app.post('/config/inicialiazar_plantillas/', function(req, res) {
    // console.log('llega la peticion');
    let plantilla = new Plantilla({
        metodo: '/pedido/nuevo/',
        mensaje: '$comercio te hizo un nuevo pedido',
        titulo: 'Nuevo Pedido',
        tipoError: 0
    });

    let plantilla2 = new Plantilla({
        metodo: '/pedido/aceptar/',
        mensaje: '$provedor acepto tu pedido',
        titulo: 'Pedido Aceptado',
        tipoError: 0
    });
    plantilla.save();
    plantilla2.save();

    res.json({
        error: 0,
        message: 'Plantillas guardadas'
    });
});

app.post('/plantilla/buscar_plantilla/', async function(req, res) {
    // console.log('Parametros a buscar');
    // console.log('Metodo: ' + req.body.metodo);
    // console.log('Tipo Error: ' + req.body.tipoError);
    Plantilla.find({ metodo: req.body.metodo, tipoError: req.body.tipoError })
        .exec((err, plantilla) => {
            if (err) {
                console.log('La busqueda de plantilla devolvio un error: ' + err.message);
                return res.json({
                    error: 1,
                    message: 'La busqueda de plantilla devolvio un error: ' + err.message,
                    plantilla: null
                });
            }

            if (plantilla.length == 0) {
                console.log('La busqueda de plantilla no devolvio resultados');
                return res.json({
                    error: 2,
                    message: 'La busqueda de plantilla no devolvio resultados',
                    plantilla: null
                });
            }

            res.json({
                error: 0,
                message: 'Plantilla encontrada',
                plantilla: plantilla[0]
            });
        })
});



module.exports = app;