const express = require('express');
const app = express();
const _ = require('underscore');
const Pedido = require('../models/pedido');
const Detalle = require('../models/detallePedido');
const funciones = require('../middlewares/funciones');
const historiaCambioEstado = require('../models/historiaCambioEstadoPedido');
// const { verificaToken } = require('../middlewares/autenticacion');

var detalles = [];


app.post('/pedido/nuevo', async function(req, res) {
    // let pedido = req.body.pedido;
    let detalleGuardado = true;


    //doy de alta el detalle del pedido
    for (var i in req.body.detalle) {
        // console.log(req.body.detalle[i]);
        let detalle = new Detalle({
            producto: req.body.detalle[i].producto,
            unidadMedida: req.body.detalle[i].unidadMedida,
            cantidad: req.body.detalle[i].cantidad
        });
        try {
            let respuesta = await funciones.nuevoDetalle(detalle);
            if (respuesta.ok) {
                detalles.push(detalle._id);
            }

            // console.log('array de contactos antes de asignarselo al cliente: ' + contactos);
        } catch (e) {
            // console.log('Error al guardar el contacto: ' + detalle);
            // console.log('Error de guardado: ' + e);
            detalleGuardado = false;
        }
    }

    if (detalleGuardado) {
        let pedido = new Pedido({
            proveedor: req.body.pedido.proveedor,
            comercio: req.body.pedido.comercio,
            estado: '5b4faa1d3c9da933c9cc2fb0'
        });

        for (var i in detalles) {
            // console.log('el cliente tiene este contacto: ' + contactos[i]);
            pedido.detallePedido.push(detalles[i]);
        }

        pedido.save((err, pedidoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            //ahora guardo la historia de cambio de estado del pedido
            let historia = new historiaCambioEstado({
                pedido: pedido._id,
                estadoAnterior: '5b4faa1d3c9da933c9cc2faf',
                nuevoEstado: '5b4faa1d3c9da933c9cc2fb0'
            });

            historia.save((err, HistoriaDB) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    pedidoDB
                });
            })



        });
    }

})


app.get('/pedido/todos', async function(req, res) {
    // let comercio = req.query.comercio;
    // console.log(`El proveedor a buscar es ${proveedor}`);
    Pedido.find()
        .populate('proveedor')
        .populate('detallePedido')
        .populate('comercio')
        .populate({ path: 'detallePedido', populate: { path: 'producto' } })
        .populate({ path: 'detallePedido', populate: { path: 'unidadMedida' } })
        .populate('estado')
        .where({ 'comercio': req.query.comercio })
        .exec((err, pedidos) => {

            // console.log(usuarios.length);

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!pedidos) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No hay pedidos para ese comercio'
                    }
                });
            }

            // clientes = clientes.filter(function(clientes) {
            //     return clientes.titular != null;
            // })

            return res.json({
                ok: true,
                recordsTotal: pedidos.length,
                // recordsFiltered: clientes.length,
                pedidos
            });

        });
})



module.exports = app;