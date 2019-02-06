const express = require('express');
const app = express();

const Pedido = require('../../server_pedido/models/pedido');
const funciones = require('../../middlewares/funciones');
const DetallePedido = require('../../server_pedido/models/detallePedido');
const Alias = require('../../server_entidades/models/alias');
const Proveedor = require('../../server_entidades/models/proveedor');
const Comercio = require('../../server_entidades/models/comercio');



app.post('/reportes/ranking_clientes/', async function(req, res) {

    let hoy = new Date();
    let i = 0;
    let hasta = req.body.pedidos.length;
    let clientes = [];
    if (hasta > 0) {
        while (i < hasta) {
            if (i == 0) {
                //es el primer elemento, va derecho al array
                let cliente = {
                    _id: req.body.pedidos[i].comercio._id,
                    razonSocial: req.body.pedidos[i].comercio.entidad.razonSocial,
                    montoTotal: req.body.pedidos[i].montoTotalPedido
                };
                clientes.push(cliente);
            } else {
                let cargado = false;
                let j = 0;
                while (j < clientes.length) {
                    j++;
                    if (clientes[j]._id == req.body.pedidos[i].comercio._id) {
                        clientes[j].montoTotal = clientes[j].montoTotal + req.body.pedidos[i].montoTotalPedido;
                        cargado = true;
                        break;
                    }
                }
                if (!cargado) {
                    let cliente = {
                        _id: req.body.pedidos[i].comercio._id,
                        razonSocial: req.body.pedidos[i].comercio.entidad.razonSocial,
                        montoTotal: req.body.pedidos[i].montoTotalPedido
                    };
                    clientes.push(cliente);
                }
            }
            i++;
        }
        return res.json({
            ok: true,
            message: 'Pedidos analizados. Devolviendo datos',
            cantidadClientes: clientes.length,
            ranking: clientes,
            pedidosPorCliente: (req.body.pedidos.length / clientes.length)
        });
    } else {
        console.log(hoy + ' No hay pedidos para analizar');
        return res.json({
            ok: false,
            message: 'No hay pedidos para analizar',
            cantidadClientes: 0,
            ranking: null,
            pedidosPorCliente: 0.0
        });
    }

});










module.exports = app;