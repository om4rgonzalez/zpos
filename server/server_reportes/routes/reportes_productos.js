const express = require('express');
const app = express();

const Pedido = require('../../server_pedido/models/pedido');
const funciones = require('../../middlewares/funciones');
const DetallePedido = require('../../server_pedido/models/detallePedido');
const Alias = require('../../server_entidades/models/alias');
const Proveedor = require('../../server_entidades/models/proveedor');



app.post('/reportes/cantidad_productos_en_pedidos/', async function(req, res) {

    let hoy = new Date();
    let i = 0;
    let hasta = req.body.pedidos.length;
    let productos = [];

    while (i < hasta) {
        // console.log('');
        // console.log('Analizando el siguiente pedido');
        // console.log(req.body.pedidos[i]);
        let j = 0;
        let h = req.body.pedidos[i].detallePedido.length;
        // console.log('Hay ' + h + ' detalles para analizar');
        while (j < h) {
            if (productos.length == 0) {
                //no hay productos cargados, debo cargar el primero
                // console.log('');
                // console.log('Analizando un detalle de pedido');
                // console.log(req.body.pedidos[i].detallePedido[j]);
                let producto = {
                    nombre: req.body.pedidos[i].detallePedido[j].producto_.nombreProducto,
                    empaque: req.body.pedidos[i].detallePedido[j].empaque,
                    cantidad: req.body.pedidos[i].detallePedido[j].cantidadPedido
                }
                productos.push(producto);
            } else {
                //el array ya tiene datos, debo saber si el producto que estoy analizando ya esta cargado
                let index = productos.map(function(e) { return e.nombre; }).indexOf(req.body.pedidos[i].detallePedido[j].producto_.nombreProducto);
                // console.log('La busqueda de ' + req.body.pedidos[i].detallePedido[j].producto_.nombreProducto + ' devolvio ' + index);
                if (index > -1) {
                    //encontro algo, hay que actualizar la cantidad pedida
                    // console.log('Producto encontrado, sumando la cantidad');
                    let suma = productos[index].cantidad + req.body.pedidos[i].detallePedido[j].cantidadPedido;
                    productos[index].cantidad = suma;
                } else {
                    //el producto no esta cargado, tengo que agregarlo
                    let producto = {
                        nombre: req.body.pedidos[i].detallePedido[j].producto_.nombreProducto,
                        empaque: req.body.pedidos[i].detallePedido[j].empaque,
                        cantidad: req.body.pedidos[i].detallePedido[j].cantidadPedido
                    }
                    productos.push(producto);
                }
            }
            j++;
        }
        // console.log('Pedido ' + i + ' analizado');
        // console.log('Pasando a analizar el siguiente pedido');
        // console.log('');
        i++;

    }

    productos.sort(function(a, b) {
        return (b.cantidad - a.cantidad)
    });

    return res.json({
        ok: true,
        productos
    });
});












module.exports = app;