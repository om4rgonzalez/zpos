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

app.get('/conf/status/', function(req, res) {
    console.log('Ambiente: ' + process.env.NODE_ENV);
    console.log('URL del servicio: ' + process.env.URL_SERVICE);
    console.log('Puerto escuchando: ' + process.env.PORT);
    console.log('URL base de datos: ' + process.env.urlDB);

    res.json({
        ambiente: process.env.NODE_ENV,
        urlServicio: process.env.URL_SERVICE,
        puerto: process.env.PORT,
        baseDatos: process.env.urlDB
    });

});



module.exports = app;