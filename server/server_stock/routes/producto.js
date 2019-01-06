const express = require('express');
const app = express();
const Producto = require('../models/producto_');
const Proveedor = require('../../server_entidades/models/proveedor');
const HistoriaPrecioProveedor = require('../models/historiaCambioPrecioProveedor');
const HistoriaPrecioSugerido = require('../models/historiaCambioPrecioSugerido');
const ImagenProducto = require('../models/imagenProducto');
const VideoProducto = require('../models/videoProducto');
const fs = require('fs');


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


app.post('/producto/cargar_imagenes/', async function(req, res) {
    let hoy = new Date();
    for (var i in req.body.imagenes) {
        hoy = new Date();
        let imagenProducto = new ImagenProducto({
            formato: req.body.imagenes[i].extension
        });

        if (req.body.imagenes[i].extension == 'png' || req.body.imagenes[i].extension == 'jpg' || req.body.imagenes[i].extension == 'jpeg') {
            console.log(hoy + ' Paso la validacion de formato de imagen');
            var target_path = process.env.UrlImagenProducto + imagenProducto._id + '.' + req.body.imagenes[i].extension; // hacia donde subiremos nuestro archivo dentro de nuestro servidor
            console.log(hoy + ' Path Destino: ' + target_path);
            await fs.writeFile(target_path, new Buffer(req.body.imagenes[i].imagen, "base64"), async function(err) {
                //Escribimos el archivo

                if (err) {
                    console.log(hoy + ' La subida del archivo produjo un error: ' + err.message);
                    return {
                        ok: false,
                        message: 'La subida del archivo produjo un error'
                    };
                }
                console.log(hoy + ' La imagen se termino de mover');
                imagenProducto.url = 'http://www.bintelligence.net/imagenes_productos/' + imagenProducto._id + '.' + req.body.imagenes[i].extension;
                imagenProducto.nombre = imagenProducto._id;

                console.log(hoy + ' Se esta por guardar el registro de la imagen');
                try {
                    imagenProducto.save((error, imagen_) => {
                        if (error) {
                            console.log(hoy + ' El alta de la imagen produjo un error: ' + error.message);

                            return res.json({
                                ok: false,
                                message: 'El alta de la publicidad produjo un error: ' + error.message
                            });
                        }
                        console.log(hoy + 'Imagen guardada');
                    });
                } catch (e) {
                    console.log('Salida por el catch: ' + e.message);
                }
            });
        }
    }
    console.log(hoy + ' Termino el proceso');
    res.json({
        ok: true,
        message: 'Las imagenes se cargaron correctamente'
    });
});




module.exports = app;