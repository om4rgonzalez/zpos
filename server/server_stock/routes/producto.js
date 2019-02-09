const express = require('express');
const app = express();
const Producto = require('../models/producto_');
const Proveedor = require('../../server_entidades/models/proveedor');
const HistoriaPrecioProveedor = require('../models/historiaCambioPrecioProveedor');
const HistoriaPrecioSugerido = require('../models/historiaCambioPrecioSugerido');
const ImagenProducto = require('../models/imagenProducto');
const VideoProducto = require('../models/videoProducto');
const fs = require('fs');
const funciones = require('../../middlewares/funciones');
const Empaques = require('../src/empaque.json');


app.post('/producto/nuevo/', async function(req, res) {
    let productos_ = [];
    if (req.body.productos) {
        try {
            for (var i in req.body.productos) {

                let producto = new Producto({
                    nombreProducto: req.body.productos[i].nombreProducto.toUpperCase(),
                    precioProveedor: req.body.productos[i].precioProveedor,
                    precioSugerido: req.body.productos[i].precioSugerido,
                    categoria: req.body.productos[i].categoria.toUpperCase(),
                    subcategoria: req.body.productos[i].subcategoria.toUpperCase(),
                    unidadMedida: req.body.productos[i].unidadMedida.toUpperCase(),
                    detalleProducto: req.body.productos[i].detalleProducto,
                    empaque: req.body.productos[i].empaque,
                    unidadesPorEmpaque: req.body.productos[i].unidadesPorEmpaque
                });

                if (req.body.productos[i].stock == -1) {
                    producto.stock = 100000000;
                } else {
                    producto.stock = req.body.productos[i].stock;
                }
                if (req.body.productos[i].codigoProveedor == 0) {
                    //debo obtener el indice para este producto sin codigo
                    producto.codigoProveedor = await funciones.obtenerIndice();
                } else {
                    producto.codigoProveedor = req.body.productos[i].codigoProveedor;
                }
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


app.get('/producto/obtener_tipos_empaque/', async function(req, res) {
    res.json(Empaques);
})

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

app.post('/producto/actualizar/', async function(req, res) {
    let hoy = new Date();
    if (req.body.productos) {
        for (var i in req.body.productos) {
            let update = {};
            let historiaCambioPrecioProveedor = new HistoriaPrecioProveedor();
            let historiaCambioPrecioSugerido = new HistoriaPrecioSugerido();
            if (req.body.productos[i].precioProveedor) {

                update.precioProveedor = req.body.productos[i].precioProveedor;

                historiaCambioPrecioProveedor.precio = req.body.productos[i].precioProveedor
                historiaCambioPrecioProveedor.save();
                Producto.findByIdAndUpdate(req.body.productos[i].idProducto, {
                        $push: {
                            historialPrecioProveedor: historiaCambioPrecioProveedor._id
                        }
                    },
                    async function(err, success) {
                        if (err) {
                            console.log(hoy + ' La funcion de actualizacion del precio proveedor devolvio un error');
                            console.log(hoy + ' ' + err.message);
                            return res.json({
                                ok: false,
                                message: 'La funcion de actualizacion del precio proveedor devolvio un error'
                            });
                        }
                        console.log(hoy + ' Se termino la actualizacion del precio proveedor');
                    });
            }
            if (req.body.productos[i].precioSugerido) {
                update.precioSugerido = req.body.productos[i].precioSugerido;

                historiaCambioPrecioSugerido.precio = req.body.productos[i].precioSugerido;
                historiaCambioPrecioSugerido.save();
                Producto.findByIdAndUpdate(req.body.productos[i].idProducto, {
                        $push: {
                            historiaPrecioSugerido: historiaCambioPrecioSugerido._id
                        }
                    },
                    async function(err, success) {
                        if (err) {
                            console.log(hoy + ' La funcion de actualizacion del precio sugerido devolvio un error');
                            console.log(hoy + ' ' + err.message);
                            return res.json({
                                ok: false,
                                message: 'La funcion de actualizacion del precio sugerido devolvio un error'
                            });
                        }
                        console.log(hoy + ' Se termino la actualizacion del precio sugerido');
                    });
            }
            if (req.body.productos[i].nombreProducto) {
                update.nombreProducto = req.body.productos[i].nombreProducto.toUpperCase();
            }
            if (req.body.productos[i].categoria) {
                update.categoria = req.body.productos[i].categoria.toUpperCase();
            }
            if (req.body.productos[i].subcategoria) {
                update.subcategoria = req.body.productos[i].subcategoria.toUpperCase();
            }
            if (req.body.productos[i].stock) {
                update.stock = req.body.productos[i].stock;
            }
            if (req.body.productos[i].unidadMedida) {
                update.unidadMedida = req.body.productos[i].unidadMedida.toUpperCase();
            }
            if (req.body.productos[i].codigoProveedor) {
                update.codigoProveedor = req.body.productos[i].codigoProveedor;
            }

            Producto.findByIdAndUpdate(req.body.productos[i].idProducto, update, { new: true }, (err, success) => {
                if (err) {
                    console.log(hoy + ' La funcion de actualizacion de producto devolvio un error');
                    console.log(hoy + ' ' + err.message);
                    return res.json({
                        ok: false,
                        message: 'La funcion de actualizacion de producto devolvio un error'
                    });
                }

                console.log(hoy + ' La actualizacion de datos del producto finalizo correctamente');
            });
        }
        console.log(hoy + ' El proceso de actualizacion finalizo');
        res.json({
            ok: true,
            message: 'La actualizacion termino correctamente'
        });
    }
});

app.get('/producto/obtener_productos/', async function(req, res) {
    let hoy = new Date();
    Proveedor.findOne({ '_id': req.query.idProveedor })
        .populate('productos_')
        .populate({ path: 'productos_', select: '_id precioProveedor precioSugerido categoria subcategoria imagenes videos nombreProducto codigoProveedor stock unidadMedida ' })
        // .select('')
        .exec((err, proveedorDB) => {
            if (err) {
                console.log(hoy + ' La busqueda de productos devolvio un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de productos devolvio un error',
                    // categorias: null,
                    productos: null
                });
            }

            if (!proveedorDB) {
                if (proveedorDB.productos_.lenght == 0) {
                    console.log(hoy + ' El proveedor no tiene cargado productos');
                    return res.json({
                        ok: false,
                        message: 'El proveedor no tiene cargado productos',
                        // categorias: null,
                        productos: null

                    });
                }

            }

            //ahora debo buscar las categorias y sub categorias

            // let i = 0;
            // let hasta = proveedorDB.productos_.lenght;
            // while(i < hasta){

            //     i++;
            // }
            // console.log(proveedorDB);
            // console.log(proveedorDB.productos);
            // if (!proveedorDB[0].productos)
            //     return res.json({
            //         ok: false,
            //         message: 'El proveedor no tiene productos asociados'
            //     });

            let productos = proveedorDB.productos_;
            return res.json({
                ok: true,
                productos
            });

        });
});


app.post('/producto/reducir_stock/', async function(req, res) {

    let hoy = new Date();
    try {
        Producto.findOne({ _id: req.body.idProducto })
            .exec(async(err, producto) => {
                if (err) {
                    console.log(hoy + ' La busqueda de producto para actualizar el stock fallo');
                    console.log(err.message + ' ' + err.message);
                    return res.json({
                        ok: false,
                        message: 'La busqueda de producto para actualizar el stock fallo'
                    });
                }
                if (producto == null) {
                    console.log(hoy + ' La busqueda de un producto para su actualizacion no devolvio resultado');
                    console.log(hoy + ' Id buscado: ' + req.body.idProducto);
                    return res.json({
                        ok: false,
                        message: 'La busqueda de un producto para su actualizacion no devolvio resultado'
                    });
                }

                // if ((producto.stock > 0) || (producto.stock < req.body.valor)) {

                let nuevoStock = producto.stock - req.body.valor;
                Producto.findOneAndUpdate({ _id: req.body.idProducto }, {
                        $set: {
                            stock: nuevoStock
                        }
                    },
                    async function(errU, exito) {
                        if (errU) {
                            console.log(hoy + ' La actulizacion del stock fallo');
                            console.log(hoy + ' ' + errU.message);
                            return res.json({
                                ok: false,
                                message: 'La actulizacion del stock fallo'
                            });
                        }

                        res.json({
                            ok: true,
                            message: 'Actualizacion completada'
                        });
                    });
                // } else {
                //     console.log(hoy + ' El producto no tiene stock suficiente para decrementar');
                //     return res.json({
                //         ok: false,
                //         message: 'El producto no tiene stock suficiente para decrementar'
                //     });
                // }

            });

    } catch (e) {
        console.log(hoy + ' Fallo la ejecucion de una rutina');
        console.log(hoy + ' ' + e.message);
        return res.json({
            ok: false,
            message: 'Fallo la ejecucion de una rutina'
        });
    }
})


// app.post('/producto/devolver_categorias/', async function(req, res){

//     let hoy = new Date();
//     let categorias
//     for(var i in req.body.productos){
//         Producto.findOne({})
//     }
// });


module.exports = app;