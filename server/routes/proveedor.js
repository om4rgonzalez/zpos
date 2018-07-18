const express = require('express');
const app = express();

const Proveedor = require('../models/proveedor');

app.post('/config/inicializar_proveedores', function(req, res) {

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

app.get('/proveedores/todos', async function(req, res) {
    // let comercio = req.query.comercio;
    // console.log(`El proveedor a buscar es ${proveedor}`);
    Proveedor.find()
        .exec((err, proveedores) => {

            // console.log(usuarios.length);

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!proveedores) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No hay proveedores'
                    }
                });
            }

            // clientes = clientes.filter(function(clientes) {
            //     return clientes.titular != null;
            // })

            return res.json({
                ok: true,
                recordsTotal: proveedores.length,
                // recordsFiltered: clientes.length,
                proveedores
            });

        });
})


module.exports = app;