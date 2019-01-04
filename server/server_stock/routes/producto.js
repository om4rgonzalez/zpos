const express = require('express');
const app = express();
const Producto = require('../models/producto_');
const Proveedor = require('../../server_entidades/models/proveedor');
const HistoriaPrecioProveedor = require('../models/historiaCambioPrecioProveedor');
const HistoriaPrecioSugerido = require('../models/historiaCambioPrecioSugerido');


app.post('/producto/nuevo/', async function(req, res) {
    let productos_ = [];
    if (req.body.productos) {
        try {
            for (var i in req.body.productos) {

                let producto = new Producto({
                    codigoProveedor: req.body.productos[i].codigoProveedor,
                    nombreProducto: req.body.productos[i].nombreProducto.toUpperCase(),
                    precioProveedor: req.body.productos[i].precioProveedor,
                    precioSugerido: req.body.productos[i].precioSugerido,
                    categoria: req.body.productos[i].categoria.toUpperCase(),
                    subcategoria: req.body.productos[i].subcategoria.toUpperCase(),
                    stock: req.body.productos[i].stock,
                    unidadMedida: req.body.productos[i].unidadMedida.toUpperCase()
                });
                productos_.push(producto._id);

                //guardo la historia del precio
                let historiaCambioPrecioProveedor = new HistoriaPrecioProveedor({
                    precio: req.body.productos[i].precioProveedor
                });

                historiaCambioPrecioProveedor.save();
                producto.historialPrecioProveedor.push(historiaCambioPrecioProveedor._id);

                //guardo la historia de cambio de precio sugerido
                if (req.body.productos[i].precioSugerido) {
                    let historiaCambioPrecioSugerido = new HistoriaPrecioSugerido({
                        precio: req.body.productos[i].precioSugerido
                    });

                    producto.historiaPrecioSugerido.push(historiaCambioPrecioSugerido._id);
                    historiaCambioPrecioSugerido.save();
                }


                producto.save();
                Proveedor.findOneAndUpdate({ _id: req.body.idProveedor }, { $push: { productos_: producto._id } },
                    function(err, ok) {
                        if (err) {
                            console.log('La insercion del producto en el proveedor arrojo un error');
                            console.log(err.message);
                        }
                    });
            }
        } catch (e) {
            return res.json({
                ok: false,
                message: 'Fallo la ejecucion de una funcion durante el guardado de un producto',
                error: e.message
            });
        }

        //resta asignarle los productos al proveedor

        res.json({
            ok: true,
            message: 'Alta terminada',
            error: 'Sin errores'
        });
    }
});




module.exports = app;