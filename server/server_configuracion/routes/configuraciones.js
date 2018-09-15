const express = require('express');
const app = express();
const funciones = require('../../middlewares/funciones');





app.post('/conf/combos/', async function(req, res) {
    console.log('se llamo al servicio que devuelve combos');
    let respuesta = await funciones.combosNuevoProveedor();
    res.json({
        ok: true,
        respuesta
    });
});



module.exports = app;