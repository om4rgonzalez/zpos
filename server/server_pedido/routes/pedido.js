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
            estadoPedido: 'PEDIDO INFORMADO',
            estadoTerminal: false,
            comentario: req.body.comentario
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
        .populate('proveedor', 'entidad')
        .populate('detallePedido')
        .sort({ fecha: -1 })
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

            res.json({
                ok: true,
                pedidos
            })

        });

});


app.get('/pedido/listar_pedidos_proveedor/', async function(req, res) {

    // console.log('comercio: ' + req.query.idComercio);

    Pedido.find({ proveedor: req.query.idProveedor })
        .populate('comercio', 'entidad')
        .populate('detallePedido')
        .sort({ fecha: -1 })
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

            res.json({
                ok: true,
                pedidos
            })

        });

});

app.get('/pedido/listar_pedidos_pendientes/', async function(req, res) {

    // console.log('comercio: ' + req.query.idComercio);

    Pedido.find({ proveedor: req.query.idProveedor })
        .populate('comercio', 'entidad')
        .populate('detallePedido')
        .where({ estadoPedido: 'PEDIDO INFORMADO' })
        .sort({ fecha: -1 })
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

            res.json({
                ok: true,
                pedidos
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

        res.json({
            ok: true,
            message: 'El pedido fue aceptado'
        });
    });

});

app.post('/pedido/rechazar/', async function(req, res) {

    //cambiar el estado al pedido
    Pedido.findOneAndUpdate({ '_id': req.body.idPedido, estadoTerminal: false }, { $set: { estadoPedido: 'RECHAZADO', estadoTerminal: true } }, function(err, exito) {
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
            estadoPedido: 'PEDIDO INFORMADO',
            estadoTerminal: false,
            comentario: req.body.comentario
        });

        pedido.save();
        return res.json({
            ok: true,
            message: 'El pedido ha sido registrado'
        });
    }
});





module.exports = app;