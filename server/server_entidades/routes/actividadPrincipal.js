const express = require('express');
const app = express();

const ActividadPrincipal = require('../../config/actividadesPrincipalesProveedores.json');




app.get('/conf/actividades_principales/', function(req, res) {

    res.json(ActividadPrincipal);
});




module.exports = app;