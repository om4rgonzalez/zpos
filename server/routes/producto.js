const express = require('express');
const app = express();
const _ = require('underscore');
const Producto = require('../models/producto');
// const { verificaToken } = require('../middlewares/autenticacion');



app.post('/producto/inicializar_productos', function(req, res) {
    //KG: 5b4d6a76bcc15c21246e24a1
    //UNIDAD: 5b4d6a76bcc15c21246e24a0
    //DOCENA: 5b4d6a76bcc15c21246e24a2
    //PACK: 5b4d6a76bcc15c21246e24a4

    let valores = [{ nombre: 'MIGNON', precioUnitario: 0, proveedor: '5b4d6e779ac864257c6d084b', medidasAceptadas: ['5b4d6a76bcc15c21246e24a1'] },
        { nombre: 'FELIPE', precioUnitario: 0, proveedor: '5b4d6e779ac864257c6d084b', medidasAceptadas: ['5b4d6a76bcc15c21246e24a1'] },
        { nombre: 'PAN FRANCES', precioUnitario: 0, proveedor: '5b4d6e779ac864257c6d084b', medidasAceptadas: ['5b4d6a76bcc15c21246e24a0', '5b4d6a76bcc15c21246e24a2'] },
        { nombre: 'BIZCOCHO GORDO', precioUnitario: 0, proveedor: '5b4d6e779ac864257c6d084b', medidasAceptadas: ['5b4d6a76bcc15c21246e24a1'] },
        { nombre: 'BIZCOCHO FLACO', precioUnitario: 0, proveedor: '5b4d6e779ac864257c6d084b', medidasAceptadas: ['5b4d6a76bcc15c21246e24a1'] },
        { nombre: 'BAGUETTES', precioUnitario: 0, proveedor: '5b4d6e779ac864257c6d084b', medidasAceptadas: ['5b4d6a76bcc15c21246e24a0', '5b4d6a76bcc15c21246e24a2'] },
        { nombre: 'MIGNON DE SALVADO', precioUnitario: 0, proveedor: '5b4d6e779ac864257c6d084b', medidasAceptadas: ['5b4d6a76bcc15c21246e24a1'] },
        { nombre: 'VIGILANTE', precioUnitario: 0, proveedor: '5b4d6e779ac864257c6d084b', medidasAceptadas: ['5b4d6a76bcc15c21246e24a0', '5b4d6a76bcc15c21246e24a2'] },
        { nombre: 'MEDIALUNA', precioUnitario: 0, proveedor: '5b4d6e779ac864257c6d084b', medidasAceptadas: ['5b4d6a76bcc15c21246e24a0', '5b4d6a76bcc15c21246e24a2'] },
        { nombre: 'DONAS', precioUnitario: 0, proveedor: '5b4d6e779ac864257c6d084b', medidasAceptadas: ['5b4d6a76bcc15c21246e24a0', '5b4d6a76bcc15c21246e24a2'] }
    ];

    let respuesta = [];
    for (var i = 0; i < valores.length; i++) {
        let item = new Producto({
            nombre: valores[i].nombre,
            precioUnitario: valores[i].precioUnitario,
            proveedor: valores[i].proveedor,
            medidasAceptadas: valores[i].medidasAceptadas
        });



        item.save();
    }
})


app.get('/producto/todos', async function(req, res) {
    let proveedor = req.query.proveedor;
    // console.log(`El proveedor a buscar es ${proveedor}`);
    Producto.find()
        .populate('medidasAceptadas')
        .where({ 'proveedor': proveedor })
        .exec((err, productos) => {

            // console.log(usuarios.length);

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productos) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No hay Productos para ese proveedor'
                    }
                });
            }

            // clientes = clientes.filter(function(clientes) {
            //     return clientes.titular != null;
            // })

            return res.json({
                ok: true,
                recordsTotal: productos.length,
                // recordsFiltered: clientes.length,
                productos
            });

        });
})



module.exports = app;