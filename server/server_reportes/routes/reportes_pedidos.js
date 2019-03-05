const express = require('express');
const app = express();

const Pedido = require('../../server_pedido/models/pedido');
const funciones = require('../../middlewares/funciones');
const DetallePedido = require('../../server_pedido/models/detallePedido');
const Alias = require('../../server_entidades/models/alias');
const Proveedor = require('../../server_entidades/models/proveedor');


app.post('/pedido/listar_pedidos_admin/', async function(req, res) {

    let hoy = new Date();

    Pedido.find({})
        .populate({ path: 'proveedor', select: 'entidad', populate: { path: 'entidad' } })
        .populate({ path: 'comercio', select: '_id entidad', populate: { path: 'entidad', populate: { path: 'domicilio' } } })
        .populate('detallePedido')
        .populate({ path: 'detallePedido', populate: { path: 'producto_' } })
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

app.post('/reportes/resumen_estadistico/', async function(req, res) {
    let hoy = new Date();

    Pedido.find({ proveedor: req.body.idProveedor })
        .populate({ path: 'proveedor', select: 'entidad', populate: { path: 'entidad' } })
        .populate({ path: 'comercio', select: 'entidad', populate: { path: 'entidad' } })
        .populate({ path: 'detallePedido', populate: { path: 'producto_' } })
        .exec(async(err, pedidos) => {
            if (err) {
                console.log(hoy + ' La consulta principal del resumen estadistico arrojo un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'La consulta principal del resumen estadistico arrojo un error',
                    estadisticas: null
                });
            }

            let hasta = pedidos.length;
            if (hasta == 0) {
                console.log(hoy + ' El proveedor no tiene pedidos para analizar');
                return res.json({
                    ok: false,
                    message: 'El proveedor no tiene pedidos para analizar',
                    estadisticas: null
                });
            }

            let i = 0;
            let pedidos_ = [];
            let montoTotalPedidos = 0.0;
            let cantidadPedidosAceptados = 0;
            let cantidadPedidosRechazados = 0;
            let cantidadPedidosInformados = 0;
            let estadisticas = [];
            let estadisticas_ = {
                    montoTotalPedidos: 0,
                    cantidadTotalPedidos: 0,
                    cantidadPedidosAceptados: 0,
                    cantidadPedidosRechazados: 0,
                    cantidadPedidosInformados: 0,
                    montoPromedioPorPedido: 0,
                    productosPedidos: 0,
                    productosMasPedidos: 0,
                    productosMenosPedidos: 0,
                    rankingProductos: [],
                    clientesQuePidieron: 0,
                    rankingClientes: [],
                    promedioPedidosPorCliente: 0.0,
                    pedidosPorDia: null,
                    totalClientes: 0,
                    nuevosClientes: 0,
                    clientesFieles: 0,
                    clientesNoFieles: 0
                }
                ///////////////SECCION DE ARMADO DE ARRAY DE PEDIDOS Y ANALISIS DE DATOS BASICOS   
            console.log(hoy + ' Armando el array de pedidos');
            // console.log('Hay ' + hasta + ' pedidos para analizar');

            while (i < hasta) {
                let dia = await pedidos[i].fechaAlta.getDate();


                let mes = await pedidos[i].fechaAlta.getMonth();
                mes++;
                if (mes > 12)
                    mes = 1;

                let anio = await pedidos[i].fechaAlta.getFullYear();
                if (dia.toString().length == 1) {
                    dia = '0' + dia;
                }
                if (mes.toString().length == 1) {
                    mes = '0' + mes;
                }
                let fechaNum = anio.toString() + mes.toString() + dia.toString();
                // console.log('Fecha a analizar: ' + fechaNum);
                // console.log('Fecha inicio: ' + req.body.anioInicio + req.body.mesInicio + req.body.diaInicio);
                // console.log('Fecha Fin: ' + req.body.anioFin + req.body.mesFin + req.body.diaFin);
                if ((parseInt(req.body.anioInicio + req.body.mesInicio + req.body.diaInicio, 10) <= parseInt(fechaNum, 10)) && (parseInt(anio + mes + dia, 10) <= parseInt(req.body.anioFin + req.body.mesFin + req.body.diaFin, 10))) {
                    //la fecha del pedido cumple con la condicion
                    pedidos_.push(pedidos[i]);
                    if (pedidos[i].estadoPedido == 'PEDIDO SOLICITADO') {
                        cantidadPedidosInformados++;
                    }

                    if (pedidos[i].estadoPedido == 'RECHAZADO') {
                        cantidadPedidosRechazados++;
                    }

                    if (pedidos[i].estadoPedido == 'ACEPTADO') {
                        cantidadPedidosAceptados++;
                        // console.log('Calculando el monto total de pedidos');

                        let j = 0;
                        let h = pedidos[i].detallePedido.length;
                        while (j < h) {
                            // console.log('');
                            // console.log('Cantidad: ' + pedidos[i].detallePedido[j].cantidadPedido);
                            // console.log('Precio unitario: ' + pedidos[i].detallePedido[j].precioProveedor);
                            montoTotalPedidos = montoTotalPedidos + (pedidos[i].detallePedido[j].cantidadPedido * pedidos[i].detallePedido[j].precioProveedor);
                            j++;
                        }
                    }


                }
                i++;
            }
            estadisticas_.montoTotalPedidos = montoTotalPedidos;
            estadisticas_.cantidadTotalPedidos = pedidos_.length;
            estadisticas_.cantidadPedidosAceptados = cantidadPedidosAceptados;
            estadisticas_.cantidadPedidosInformados = cantidadPedidosInformados;
            estadisticas_.cantidadPedidosRechazados = cantidadPedidosRechazados;
            if (cantidadPedidosAceptados != 0)
                estadisticas_.montoPromedioPorPedido = (montoTotalPedidos / cantidadPedidosAceptados);

            ///////////////SECCION DE ANALISIS DE PRODUCTOS QUE FIGURAN EN LOS PEDIDOS/////////////////
            console.log(hoy + ' Llamando a la funcion para armar el ranking de productos');
            let r = await funciones.devolverProductosDePedidos(pedidos_);
            estadisticas_.productosPedidos = r.productos.length;
            estadisticas_.rankingProductos = r.productos;

            //////////// SECCION DE ANALISIS DE CLIENTES /////////////////////
            console.log(hoy + ' Llamando a la funcion para armar el ranking de clientes');
            let c = await funciones.devolverRankingClientes(pedidos_);
            estadisticas_.clientesQuePidieron = c.cantidadClientes;
            estadisticas_.rankingClientes = c.ranking;
            estadisticas_.promedioPedidosPorCliente = c.pedidosPorCliente;

            return res.json({
                ok: true,
                message: 'Devolviendo estadisticas',
                estadisticas: estadisticas_
            });
        });
});

app.post('/reportes/pedidos_aceptados/', async function(req, res) {

    let hoy = new Date();
    Pedido.find({ proveedor: req.body.idProveedor })
        .populate({ path: 'comercio', select: 'entidad', populate: { path: 'entidad', populate: { path: 'domicilio' } } })
        .populate({ path: 'detallePedido', select: '_id activo cantidadPedido', populate: { path: 'producto_', select: '_id  precioProveedor categoria subcategoria nombreProducto empaque unidadesPorEmpaque unidadMedida' } })
        .exec(async(err, pedidos) => {
            if (err) {
                console.log(hoy + ' La consulta de pedidos aceptados devolvio un error');
                console.log(hoy + err.message);
                return res.json({
                    ok: false,
                    message: 'La consulta de pedidos aceptados devolvio un error',
                    pedidos: null
                });
            }

            if (pedidos.length == 0) {
                console.log(hoy + ' La consulta de pedidos aceptados no devolvio resultados');
                return res.json({
                    ok: false,
                    message: 'La consulta de pedidos aceptados no devolvio resultados',
                    pedidos: null
                });
            }

            let i = 0;
            let hasta = pedidos.length;
            let pedidos_ = [];
            while (i < hasta) {
                // console.log('Armando el array de pedidos');
                let j = 0;
                let h = pedidos[i].detallePedido.length;
                let pedido_ = {
                    idPedido: pedidos[i]._id,
                    comercio: pedidos[i].comercio,
                    detalle: []
                };
                while (j < h) {
                    let k = 0;
                    // console.log('Mostrando el detalle de un pedido');
                    // console.log(pedidos[i].detallePedido[j]);
                    let detalle_ = {
                        idDetalle: pedidos[i].detallePedido[j]._id,
                        idProducto: pedidos[i].detallePedido[j].producto_._id,
                        precioProveedor: pedidos[i].detallePedido[j].producto_.precioProveedor,
                        categoria: pedidos[i].detallePedido[j].producto_.categoria,
                        subcategoria: pedidos[i].detallePedido[j].producto_.subcategoria,
                        nombreProducto: pedidos[i].detallePedido[j].producto_.nombreProducto,
                        empaque: pedidos[i].detallePedido[j].producto_.empaque,
                        unpeidadesPorEmpaque: pedidos[i].detallePedido[j].producto_.unidadesPorEmpaque,
                        unidadMedida: pedidos[i].detallePedido[j].producto_.unidadMedida
                    }
                    pedido_.detalle.push(detalle_);
                    j++;
                }
                i++;
                pedidos_.push(pedido_);
            }

            res.json({
                ok: true,
                message: 'Devolviendo pedidos',
                pedidos: pedidos_
            });
        });
});


module.exports = app;