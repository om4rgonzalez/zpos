const express = require('express');
const app = express();
const _ = require('underscore');
const Pedido = require('../models/pedido');
const Detalle = require('../models/detallePedido');
const funciones = require('../middlewares/funciones');
const historiaCambioEstado = require('../models/historiaCambioEstadoPedido');
// const { verificaToken } = require('../middlewares/autenticacion');




app.post('/pedido/nuevo', async function(req, res) {
    // let pedido = req.body.pedido;
    let detalles = [];
    let detalleGuardado = true;


    //doy de alta el detalle del pedido
    // console.log('Tamaño del array: ' + req.body.detalle.length);
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
        .sort({ "fechaAlta": -1 })
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

app.get('/pedido/pedidos_de_proveedor', async function(req, res) {
    // let comercio = req.query.comercio;
    // console.log(`El proveedor a buscar es ${proveedor}`);
    Pedido.find()
        .populate('proveedor')
        .populate('detallePedido')
        .populate('comercio')
        .populate({ path: 'detallePedido', populate: { path: 'producto' } })
        .populate({ path: 'detallePedido', populate: { path: 'unidadMedida' } })
        .populate('estado')
        .where({ 'proveedor': req.query.proveedor })
        .sort({ "fechaAlta": -1 }) //, { "estado.precedencia": 1 }
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

app.put('/pedido/aceptar', function(req, res) {

    let id = req.body.pedido;
    let mensaje;
    // let usuario = req.usuario;
    let body = _.pick(req.body, ['estadoAnterior', 'estado']);
    if (req.body.aceptado == 1) {
        //el pedido fue aceptado
        body.estado = '5b4faa1d3c9da933c9cc2fb2';
        mensaje = 'El pedido fue aceptado';
    } else {
        //el pedido fue rechazado
        body.estado = '5b4faa1d3c9da933c9cc2fb3';
        mensaje = 'El pedido fue rechazado';
    }


    Pedido.findByIdAndUpdate(id, body, { new: true }, (err, PedidoDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'No se pudo realizar la actualizacion'
            });
        }

        let historia = new historiaCambioEstado({
            pedido: id,
            estadoAnterior: body.estadoAnterior,
            nuevoEstado: body.estado
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
                message: mensaje
            });
        })



    });

});

module.exports = app;