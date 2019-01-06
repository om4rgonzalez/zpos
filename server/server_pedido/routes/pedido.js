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

app.post('/pedido/nuevo_v2/', async function(req, res) {

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
                precioProveedor: req.body.productos[i].precioProveedor,
                precioSugerido: req.body.productos[i].precioSugerido
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
        .populate({ path: 'comercio', select: '_id entidad', populate: { path: 'entidad' } })
        .populate({ path: 'comercio', select: '_id entidad', populate: { path: 'entidad', populate: { path: 'domicilio' } } })
        .populate({
            path: 'comercio',
            select: 'entidad contactos',
            populate: {
                path: 'contactos',
                match: { tipoContacto: "Telefono Celular" }
            }
        })

    // .populate({
    //     path: 'rol',
    //     match: { precedencia: { $gt: idRol } }
    // })
    .populate('detallePedido')
        .populate({ path: 'detallePedido', populate: { path: 'producto' } })
        .sort({ fechaAlta: -1 })
        .exec(async(err, pedidos) => {
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
                let entidad_ = new Object({
                    _id: pedidos[cursor].comercio.entidad._id,
                    cuit: pedidos[cursor].comercio.entidad.cuit,
                    razonSocial: pedidos[cursor].comercio.entidad.razonSocial,
                    domicilio: pedidos[cursor].comercio.entidad.domicilio
                });




                //buscar alias
                // console.log('Se esta por buscar el alias del comercio: ' + pedidos[cursor].comercio._id);
                let alias = await funciones.buscarAlias(req.query.idProveedor, pedidos[cursor].comercio._id);
                // console.log('La consulta de alias devolvio');
                // console.log(alias);
                if (alias.ok) {
                    if (alias.alias != null) {
                        if (alias.alias != '') {
                            // console.log('Asignando el alias a la razon social');
                            entidad_.razonSocial = pedidos[cursor].comercio.entidad.razonSocial + '(' + alias.alias + ')';
                            // console.log('Razon social con alias: ' + entidad_.razonSocial);
                        }
                    }
                }

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
        .exec(async(err, pedidos) => {
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

                let entidad_ = new Object({
                    _id: pedidos[cursor].comercio.entidad._id,
                    cuit: pedidos[cursor].comercio.entidad.cuit,
                    razonSocial: pedidos[cursor].comercio.entidad.razonSocial,
                    domicilio: pedidos[cursor].comercio.entidad.domicilio
                });


                let alias = await funciones.buscarAlias(req.query.idProveedor, pedidos[cursor].comercio._id);
                // console.log('La consulta de alias devolvio');
                // console.log(alias);
                if (alias.ok) {
                    if (alias.alias != '') {
                        // console.log('Asignando el alias a la razon social');
                        // pedidos[cursor].comercio.entidad.razonSocial = pedidos[cursor].comercio.entidad.razonSocial + '(' + alias.alias + ')';
                        entidad_.razonSocial = pedidos[cursor].comercio.entidad.razonSocial + '(' + alias.alias + ')';
                    }

                }

                let comercio_ = new Object({
                    _id: pedidos[cursor].comercio._id,
                    entidad: entidad_,
                    contactos: pedidos[cursor].comercio.contactos
                });

                let pedido = new Object({
                    idPedido: pedidos[cursor]._id,
                    proveedor: pedidos[cursor].proveedor,
                    // comercio: pedidos[cursor].comercio,
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
    var hoy = new Date();
    //cambiar el estado al pedido
    Pedido.findOneAndUpdate({ '_id': req.body.idPedido, estadoTerminal: false }, { $set: { estadoPedido: 'ACEPTADO', fechaCambioEstado: hoy.getDate() } },
        function(err, exito) {
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
            // console.log('Preparando el envio de push;')
            // console.log('Parametros:');
            // console.log('Proveedor: ' + exito.proveedor);
            // console.log('Comercio: ' + exito.comercio);
            let respuestaMensajePush = funciones.nuevoMensaje({
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
    var hoy = new Date();
    //cambiar el estado al pedido
    Pedido.findOneAndUpdate({ '_id': req.body.idPedido, estadoTerminal: false }, {
            $set: { estadoPedido: 'RECHAZADO', estadoTerminal: true, comentarioCancelado: req.body.comentario, fechaCambioEstado: hoy.getDate() }
        },
        function(err, exito) {
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

            let respuestaMensaje = funciones.nuevoMensaje({
                metodo: '/pedido/rechazar/',
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
                message: 'El pedido fue rechazado'
            });
        });

});

app.post('/pedido/buscar_pedido_pendiente_entrega/', async function(req, res) {

    Pedido.findOne({ _id: req.body.idPedido, proveedor: req.body.idProveedor })
        .populate({ path: 'comercio', select: 'entidad', populate: { path: 'entidad' } })
        // .populate('detallePedido')
        .populate({ path: 'detallePedido', populate: { path: 'producto' } })
        .where({ estadoPedido: 'ACEPTADO' })
        .exec(async(err, pedido) => {
            if (err) {
                console.log('La busqueda de pedido por id produjo un error');
                console.log(err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de pedido por id produjo un error',
                    pedido: null
                });
            }

            if (pedido == null) {
                console.log('La busqueda de pedido no arrojo resultado');
                return res.json({
                    ok: false,
                    message: 'No se encontro un pedido para entregar',
                    pedido: null
                });
            }

            res.json({
                ok: true,
                message: 'Pedido encontrado',
                pedido
            });

        });
});

app.post('/pedido/entregar/', async function(req, res) {
    var hoy = new Date();
    //cambiar el estado al pedido
    Pedido.findOneAndUpdate({ '_id': req.body.idPedido, estadoTerminal: false }, {
            $set: { estadoPedido: 'ENTREGADO', estadoTerminal: true, comentarioCancelado: req.body.comentario, fechaCambioEstado: hoy.getDate() }
        },
        function(err, exito) {
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

            // let respuestaMensaje = funciones.nuevoMensaje({
            //     metodo: '/pedido/rechazar/',
            //     tipoError: 0,
            //     parametros: '$proveedor',
            //     valores: exito.proveedor,
            //     buscar: 'SI',
            //     esPush: true,
            //     destinoEsProveedor: false,
            //     destino: exito.comercio
            // });

            res.json({
                ok: true,
                message: 'El pedido fue entregado'
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

///////////// ESTADISTICAS /////////////////
app.post('/pedido/listar_pedidos_admin/', async function(req, res) {

    // console.log('comercio: ' + req.query.idComercio);


    Pedido.find({})
        .populate({ path: 'proveedor', select: 'entidad', populate: { path: 'entidad' } })
        .populate({ path: 'comercio', select: '_id entidad', populate: { path: 'entidad', populate: { path: 'domicilio' } } })
        .populate('detallePedido')
        .populate({ path: 'detallePedido', populate: { path: 'producto' } })
        .sort({ fechaAlta: -1 })
        .exec(async(err, pedidos) => {
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
                let entidad_ = new Object({
                    _id: pedidos[cursor].comercio.entidad._id,
                    cuit: pedidos[cursor].comercio.entidad.cuit,
                    razonSocial: pedidos[cursor].comercio.entidad.razonSocial,
                    domicilio: pedidos[cursor].comercio.entidad.domicilio
                });




                // //buscar alias
                // // console.log('Se esta por buscar el alias del comercio: ' + pedidos[cursor].comercio._id);
                // let alias = await funciones.buscarAlias(req.query.idProveedor, pedidos[cursor].comercio._id);
                // // console.log('La consulta de alias devolvio');
                // // console.log(alias);
                // if (alias.ok) {
                //     if (alias.alias != null) {
                //         if (alias.alias != '') {
                //             // console.log('Asignando el alias a la razon social');
                //             entidad_.razonSocial = pedidos[cursor].comercio.entidad.razonSocial + '(' + alias.alias + ')';
                //             // console.log('Razon social con alias: ' + entidad_.razonSocial);
                //         }
                //     }
                // }

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




module.exports = app;