const express = require('express');
const app = express();

const Detalle = require('../models/detallePedido');


app.post('/pedido/nuevo_detalle', function(req, res) {
    let objeto = req.body;
    let detalle = new Detalle({
        _id: objeto._id,
        producto: objeto.producto,
        unidadMedida: objeto.unidadMedida,
        cantidad: objeto.cantidad

    });

    // console.log("contacto a guardar: " + contacto);
    detalle.save((err, detalleDB) => {
        if (err) {
            // console.log("Salto un error en contacto.js: " + err);
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            detalleDB
        });

    });
})





module.exports = app;