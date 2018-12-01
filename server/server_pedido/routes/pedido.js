const express = require('express');
const app = express();

const Pedido = require('../models/pedido');
const funciones = require('../../middlewares/funciones');
const DetallePedido = require('../models/detallePedido');
const aut = require('../../middlewares/autenticacion');

app.post('/pedido/nuevo/', async function(req, res) {

    let usuario = aut.validarToken(req.body.token);
    if (!usuario) {
        return res.json({
            ok: false,
            message: 'Usuario no valido'
        });
    } else {
        let detalles = [];
        for (var i in req.body.productos) {
            let detallePedido = new DetallePedido({
                producto: req.body.productos[i]._id,
                unidadMedida: req.body.productos[i].unidadMedida,
                cantidadPedido: req.body.productos[i].cantidad,
            });
            detallePedido.save();
            detalles.push(detallePedido._id);
        }

        let pedido = new Pedido({
            proveedor: req.body.proveedor,
            comercio: req.body.comercio,
            tipoEntrega: req.body.tipoEntrega,
            fechaEntrega: req.body.fechaEntrega,
            detallePedido: detalles,
            estadoPedido: 'PEDIDO SOLICITADO',
            estadoTerminal: false,
            comentario: req.body.comentario
        });
        let respuestaMensaje = funciones.nuevoMensaje({
            metodo: '/pedido/nuevo/',
            tipoError: 0,
            parametros: '$comercio',
            valores: req.body.comercio,
            buscar: 'SI',
            esPush: true,
            destinoEsProveedor: true,
            destino: req.body.proveedor
        });

        pedido.save();
        return res.json({
            ok: true,
            message: 'El pedido ha sido registrado'
        });
    }
});


app.get('/pedido/listar_pedidos_comercio/', async function(req, res) {

    // console.log('comercio: ' + req.query.idComercio);

    Pedido.find({ comercio: req.query.idComercio })
        .populate({ path: 'proveedor', select: 'entidad', populate: { path: 'entidad' } })
        .populate({ path: 'comercio', select: 'entidad', populate: { path: 'entidad' } })
        .populate('detallePedido')
        .populate({ path: 'detallePedido', populate: { path: 'producto' } })
        .sort({ fechaAlta: -1 })
        .exec((err, pedidos) => {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'No se puede devolver la lista de pedidos. Error: ' + err.message
                });
            }

            if (!pedidos) {
                return res.json({
                    ok: false,
                    message: 'No hay pedidos para mostrar'
                });
            }

            if (pedidos.length <= 0) {
                return res.json({
                    ok: false,
                    message: 'No hay pedidos para mostrar'
                });
            }

            let hasta = pedidos.length;
            let cursor = 0;
            let pedidos_array = [];
            while (cursor < hasta) {
                let tamanioDetalle = pedidos[cursor].detallePedido.length;
                let cursorDetalle = 0;
                let totalPedido = 0;
                while (cursorDetalle < tamanioDetalle) {
                    totalPedido = totalPedido + (pedidos[cursor].detallePedido[cursorDetalle].producto.precioProveedor * pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
                    cursorDetalle++;
                }
                let pedido = new Object({
                    idPedido: pedidos[cursor]._id,
                    proveedor: pedidos[cursor].proveedor,
                    comercio: pedidos[cursor].comercio,
                    tipoEntrega: pedidos[cursor].tipoEntrega,
                    fechaEntrega: pedidos[cursor].fechaEntrega,
                    activo: pedidos[cursor].activo,
                    estadoPedido: pedidos[cursor].estadoPedido,
                    estadoTerminal: pedidos[cursor].estadoTerminal,
                    comentario: pedidos[cursor].comentario,
                    puntoVentaEntrega: pedidos[cursor].puntoVentaEntrega,
                    totalPedido: totalPedido,
                    detallePedido: pedidos[cursor].detallePedido,
                    comentarioCancelado: pedidos[cursor].comentarioCancelado
                });
                pedidos_array.push(pedido);
                cursor++;
            }

            res.json({
                ok: true,
                pedidos_array
            })

        });

});


app.get('/pedido/listar_pedidos_proveedor/', async function(req, res) {

    // console.log('comercio: ' + req.query.idComercio);

    Pedido.find({ proveedor: req.query.idProveedor })
        .populate({ path: 'proveedor', select: 'entidad', populate: { path: 'entidad' } })
        .populate({ path: 'comercio', select: 'entidad', populate: { path: 'entidad' } })
        .populate({ path: 'comercio', select: 'entidad', populate: { path: 'entidad', populate: { path: 'domicilio' } } })
        .populate('detallePedido')
        .populate({ path: 'detallePedido', populate: { path: 'producto' } })
        .sort({ fechaAlta: -1 })
        .exec((err, pedidos) => {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'No se puede devolver la lista de pedidos. Error: ' + err.message
                });
            }

            if (!pedidos) {
                return res.json({
                    ok: false,
                    message: 'No hay pedidos para mostrar'
                });
            }

            if (pedidos.length <= 0) {
                return res.json({
                    ok: false,
                    message: 'No hay pedidos para mostrar'
                });
            }

            let hasta = pedidos.length;
            let cursor = 0;
            let pedidos_array = [];
            while (cursor < hasta) {
                let tamanioDetalle = pedidos[cursor].detallePedido.length;
                let cursorDetalle = 0;
                let totalPedido = 0;
                while (cursorDetalle < tamanioDetalle) {
                    totalPedido = totalPedido + (pedidos[cursor].detallePedido[cursorDetalle].producto.precioProveedor * pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
                    cursorDetalle++;
                }
                let pedido = new Object({
                    idPedido: pedidos[cursor]._id,
                    proveedor: pedidos[cursor].proveedor,
                    comercio: pedidos[cursor].comercio,
                    tipoEntrega: pedidos[cursor].tipoEntrega,
                    fechaEntrega: pedidos[cursor].fechaEntrega,
                    activo: pedidos[cursor].activo,
                    estadoPedido: pedidos[cursor].estadoPedido,
                    estadoTerminal: pedidos[cursor].estadoTerminal,
                    comentario: pedidos[cursor].comentario,
                    puntoVentaEntrega: pedidos[cursor].puntoVentaEntrega,
                    totalPedido: totalPedido,
                    detallePedido: pedidos[cursor].detallePedido,
                    comentarioCancelado: pedidos[cursor].comentarioCancelado
                });
                pedidos_array.push(pedido);
                cursor++;
            }

            res.json({
                ok: true,
                pedidos_array
            })

        });

});

app.get('/pedido/listar_pedidos_pendientes/', async function(req, res) {

    // console.log('comercio: ' + req.query.idComercio);

    Pedido.find({ proveedor: req.query.idProveedor })
        .populate({ path: 'proveedor', select: 'entidad', populate: { path: 'entidad' } })
        .populate({ path: 'comercio', select: 'entidad', populate: { path: 'entidad' } })
        .populate('detallePedido')
        .populate({ path: 'detallePedido', populate: { path: 'producto' } })
        .where({ estadoPedido: 'PEDIDO SOLICITADO' })
        .sort({ fechaAlta: -1 })
        .exec((err, pedidos) => {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'No se puede devolver la lista de pedidos. Error: ' + err.message
                });
            }

            if (!pedidos) {
                return res.json({
                    ok: false,
                    message: 'No hay pedidos para mostrar'
                });
            }

            let hasta = pedidos.length;
            let cursor = 0;
            let pedidos_array = [];
            while (cursor < hasta) {
                let tamanioDetalle = pedidos[cursor].detallePedido.length;
                let cursorDetalle = 0;
                let totalPedido = 0;
                while (cursorDetalle < tamanioDetalle) {
                    totalPedido = totalPedido + (pedidos[cursor].detallePedido[cursorDetalle].producto.precioProveedor * pedidos[cursor].detallePedido[cursorDetalle].cantidadPedido);
                    cursorDetalle++;
                }
                let pedido = new Object({
                    idPedido: pedidos[cursor]._id,
                    proveedor: pedidos[cursor].proveedor,
                    comercio: pedidos[cursor].comercio,
                    tipoEntrega: pedidos[cursor].tipoEntrega,
                    fechaEntrega: pedidos[cursor].fechaEntrega,
                    activo: pedidos[cursor].activo,
                    estadoPedido: pedidos[cursor].estadoPedido,
                    estadoTerminal: pedidos[cursor].estadoTerminal,
                    comentario: pedidos[cursor].comentario,
                    puntoVentaEntrega: pedidos[cursor].puntoVentaEntrega,
                    totalPedido: totalPedido,
                    detallePedido: pedidos[cursor].detallePedido,
                    fechaAlta: pedidos[cursor].fechaAlta
                });
                pedidos_array.push(pedido);
                cursor++;
            }

            res.json({
                ok: true,
                pedidos_array
            })

        });

});


app.post('/pedido/aceptar/', async function(req, res) {

    //cambiar el estado al pedido
    Pedido.findOneAndUpdate({ '_id': req.body.idPedido, estadoTerminal: false }, { $set: { estadoPedido: 'ACEPTADO' } }, function(err, exito) {
        if (err) {
            return res.json({
                ok: false,
                message: 'La actualizacion produjo un error. Error: ' + err.message
            });
        }

        if (exito == null) {
            return res.json({
                ok: false,
                message: 'No se puede modificar el estado de un pedido finalizado'
            });
        }

        // console.log('Datos de la aceptacion de pedido');
        // console.log(exito);

        let respuestaMensaje = funciones.nuevoMensaje({
            metodo: '/pedido/aceptar/',
            tipoError: 0,
            parametros: '$proveedor',
            valores: exito.proveedor,
            buscar: 'SI',
            esPush: true,
            destinoEsProveedor: false,
            destino: exito.comercio
        });

        res.json({
            ok: true,
            message: 'El pedido fue aceptado'
        });
    });

});

app.post('/pedido/rechazar/', async function(req, res) {

    //cambiar el estado al pedido
    Pedido.findOneAndUpdate({ '_id': req.body.idPedido, estadoTerminal: false }, { $set: { estadoPedido: 'RECHAZADO', estadoTerminal: true, comentarioCancelado: req.body.comentario } }, function(err, exito) {
        if (err) {
            return res.json({
                ok: false,
                message: 'La actualizacion produjo un error. Error: ' + err.message
            });
        }

        if (exito == null) {
            return res.json({
                ok: false,
                message: 'No se puede modificar el estado de un pedido finalizado'
            });
        }

        res.json({
            ok: true,
            message: 'El pedido fue rechazado'
        });
    });

});

app.post('/pedido/enviar/', async function(req, res) {

    //cambiar el estado al pedido
    Pedido.findOneAndUpdate({ '_id': req.body.idPedido, estadoTerminal: false }, { $set: { estadoPedido: 'EN CAMINO', estadoTerminal: false } }, function(err, exito) {
        if (err) {
            return res.json({
                ok: false,
                message: 'La actualizacion produjo un error. Error: ' + err.message
            });
        }

        if (exito == null) {
            return res.json({
                ok: false,
                message: 'No se puede modificar el estado de un pedido finalizado'
            });
        }

        res.json({
            ok: true,
            message: 'El pedido fue rechazado'
        });
    });

});




//////////// REGION COMERCIO ///////////////
app.post('/pedido/nuevo_pedido_comercio/', async function(req, res) {


    let detalles = [];
    for (var i in req.body.productos) {
        let detallePedido = new DetallePedido({
            producto: req.body.productos[i]._id,
            unidadMedida: req.body.productos[i].unidadMedida,
            cantidadPedido: req.body.productos[i].cantidad,
        });
        detallePedido.save();
        detalles.push(detallePedido._id);
    }

    let pedido = new Pedido({
        proveedor: req.body.proveedor,
        comercio: req.body.comercio,
        tipoEntrega: req.body.tipoEntrega,
        fechaEntrega: req.body.fechaEntrega,
        detallePedido: detalles,
        estadoPedido: 'PEDIDO SOLICITADO',
        estadoTerminal: false,
        comentario: req.body.comentario
    });

    pedido.save();
    return res.json({
        ok: true,
        message: 'El pedido ha sido registrado'
    });
    // }
});





module.exports = app;