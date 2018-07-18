const express = require('express');
const app = express();

const Proveedor = require('../models/proveedor');

app.post('/producto/inicializar_proveedores', function(req, res) {

    let valores = [{ nombre: 'BUEN DIA', cuit: '00000000000' }];

    let respuesta = [];
    for (var i = 0; i < valores.length; i++) {
        let item = new Proveedor({
            nombre: valores[i].nombre,
            cuit: valores[i].cuit
        });



        item.save();
    }





})


module.exports = app;