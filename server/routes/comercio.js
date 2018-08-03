const express = require('express');
const app = express();
const _ = require('underscore');
const Comercio = require('../models/comercio');
// const { verificaToken } = require('../middlewares/autenticacion');



app.post('/comercio/inicializar_comercios/', function(req, res) {


    let valores = [
        //{ cuit: '11111111111', razonSocial: "KIOSCO DON PABLO" }, 
        { cuit: '22222222222', razonSocial: "DESPENSA EL CHAPO" }
    ];

    let respuesta = [];
    for (var i = 0; i < valores.length; i++) {
        let item = new Comercio({
            cuit: valores[i].cuit,
            razonSocial: valores[i].razonSocial
        });



        item.save();
    }
})



module.exports = app;