const express = require('express');
const app = express();

const Pedido = require('../models/pedido');
const funciones = require('../../middlewares/funciones');
const DetallePedido = require('../models/detallePedido');
const Alias = require('../../server_entidades/models/alias');
const Proveedor = require('../../server_entidades/models/proveedor');


app.post('/pedido/listar_pedidos_admin/', async function(req, res) {

    let hoy = new Date();

    Pedido.find({})
        .populate({ path: 'proveedor', select: 'entidad', populate: { path: 'entidad' } })
        .populate({ path: 'comercio', select: '_id entidad', populate: { path: 'entidad', populate: { path: 'domicilio' } } })
        .populate('detallePedido')
        .populate({ path: 'detallePedido', populate: { path: 'producto' } })
        .sort({ fechaAlta: -1 })
        .exec(async(err, pedidos) => {
            if (err) {
                console.log(hoy + ' La busqueda de pedidos para listar todos arrojo un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'No se puede devolver la lista de pedidos. Error: ' + err.message,
                    pedidos: null
                });
            }

            if (!pedidos) {
                return res.json({
                    ok: false,
                    message: 'No hay pedidos para mostrar',
                    pedidos: null
                });
            }

            if (pedidos.length <= 0) {
                return res.json({
                    ok: false,
                    message: 'No hay pedidos para mostrar',
                    pedidos: null
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
                let entidad_ = new Object({
                    _id: pedidos[cursor].comercio.entidad._id,
                    cuit: pedidos[cursor].comercio.entidad.cuit,
                    razonSocial: pedidos[cursor].comercio.entidad.razonSocial,
                    domicilio: pedidos[cursor].comercio.entidad.domicilio
                });
                let comercio_ = new Object({
                    _id: pedidos[cursor].comercio._id,
                    entidad: entidad_,
                    contactos: pedidos[cursor].comercio.contactos
                });

                let pedido = new Object({
                    idPedido: pedidos[cursor]._id,
                    proveedor: pedidos[cursor].proveedor,
                    //comercio: pedidos[cursor].comercio,
                    comercio: comercio_,
                    tipoEntrega: pedidos[cursor].tipoEntrega,
                    fechaEntrega: pedidos[cursor].fechaEntrega,
                    activo: pedidos[cursor].activo,
                    estadoPedido: pedidos[cursor].estadoPedido,
                    estadoTerminal: pedidos[cursor].estadoTerminal,
                    comentario: pedidos[cursor].comentario,
                    puntoVentaEntrega: pedidos[cursor].puntoVentaEntrega,
                    totalPedido: totalPedido,
                    detallePedido: pedidos[cursor].detallePedido,
                    comentarioCancelado: pedidos[cursor].comentarioCancelado,
                    fechaAlta: pedidos[cursor].fechaAlta
                });

                pedidos_array.push(pedido);
                cursor++;
            }

            res.json({
                ok: true,
                message: 'Devolviendo pedidos',
                pedidos: pedidos_array
            })

        });

});


app.post('/pedido/resumen_admin/', async function(req, res) {
    let hoy = new Date();
    let aceptados = 0;
    let rechazados = 0;
    let pendientes = 0;
    Pedido.find()
        .exec(async(err, pedidos) => {
            if (err) {
                console.log(hoy + ' La consulta de pedidos para armar el resumen para el admin arrojo un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'La consulta de pedidos para armar el resumen para el admin arrojo un error',
                    aceptados: 0,
                    rechazados: 0,
                    pendientes: 0
                });
            }

            if (pedidos.length == 0) {
                console.log(hoy + ' No hay pedidos registrados');
                return res.json({
                    ok: false,
                    message: 'No hay pedidos registrados',
                    aceptados: 0,
                    rechazados: 0,
                    pendientes: 0
                })
            }

            let i = 0;
            let hasta = pedidos.length;
            while (i < hasta) {
                if (pedidos[i].estadoPedido == 'ACEPTADO') {
                    aceptados++;
                }
                if (pedidos[i].estadoPedido == 'RECHAZADO') {
                    rechazados++;
                }

                if (pedidos[i].estadoPedido == 'PEDIDO SOLICITADO') {
                    pendientes++;
                }


                i++;
            }

            res.json({
                ok: true,
                message: 'Pedidos analizados',
                aceptados: aceptados,
                rechazados: rechazados,
                pendientes: pendientes
            })
        });
});

app.post('/pedido/comercios_que_piden/', async function(req, res) {
    let hoy = new Date();
    Pedido.find({})
        .populate({ path: 'proveedor', select: 'entidad', populate: { path: 'entidad' } })
        .populate({ path: 'comercio', select: 'entidad', populate: { path: 'entidad' } })
        .populate({ path: 'detallePedido', populate: { path: 'producto' } })
        .populate({ path: 'detallePedido', populate: { path: 'producto_' } })
        .exec(async(err, pedidos) => {
            if (err) {
                console.log(hoy + ' La consulta de comercios que hacen pedidos arrojo un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'La consulta de comercios que hacen pedidos arrojo un error',
                    comercios: null
                });
            }

            if (pedidos.length == 0) {
                console.log(hoy + ' No hay pedidos para analizar');
                return res.json({
                    ok: false,
                    message: 'No hay pedidos para analizar',
                    comercios: null
                });
            }

            let i = 0;
            let hasta = pedidos.length;
            //primero armo el vector de comercios
            let comercios_ = [];
            while (i < hasta) {
                if (comercios_.length == 0) {
                    comercios_.push(pedidos[i].comercio);
                } else {
                    //busco en el vector
                    let h = comercios_.length;
                    let j = 0;
                    let yaEsta = false;
                    while (j < h) {
                        if (pedidos[i].comercio._id == comercios_[j]._id) {
                            // console.log('El comercio ya esta cargado en el vector');
                            yaEsta = true;
                            break;
                        }
                        j++;
                    }
                    if (!yaEsta) {
                        //el comercio no esta cargado en el vector, lo agrego
                        comercios_.push(pedidos[i].comercio);
                    }
                }
                i++;
            }
            //ya tengo el vector de comercios, ahora tengo que ver las cantidades
            i = 0;
            let h = comercios_.length;
            let vComercios = [];
            while (i < h) {
                let j = 0;
                let cantidad = 0;
                while (j < hasta) {
                    if (comercios_[i]._id == pedidos[j].comercio._id) {
                        cantidad++;
                    }

                    j++;
                }
                let final = {
                    comercio: comercios_[i].entidad.razonSocial,
                    cuit: comercios_[i].entidad.cuit,
                    cantidadPedidos: cantidad
                };
                vComercios.push(final);
                i++;
            }



            return res.json({
                ok: true,
                message: 'Comercios encontrados',
                comercios: vComercios
            });
        })



});



module.exports = app;