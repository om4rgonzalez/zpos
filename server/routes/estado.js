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

app.get('/conf/obtener_estados', async function(req, res) {
    // let comercio = req.query.comercio;
    // console.log(`El proveedor a buscar es ${proveedor}`);
    Estado.find()
        .exec((err, estados) => {

            // console.log(usuarios.length);

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!estados) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No hay estados'
                    }
                });
            }

            // clientes = clientes.filter(function(clientes) {
            //     return clientes.titular != null;
            // })

            return res.json({
                ok: true,
                recordsTotal: estados.length,
                // recordsFiltered: clientes.length,
                estados
            });

        });
})



module.exports = app;