const express = require('express');
const app = express();
const Producto = require('../models/producto');
const ProductosNorPan = require('../src/productos-norpan.json');
const Proveedor = require('../../server_entidades/models/proveedor');



app.post('/conf/inicializar_productos/', function(req, res) {
    let valores = [{ nombreProducto: 'PAN FELIPE', precioProveedor: 38.46, precioSugerido: 50.00 },
        { nombreProducto: 'PAN MIGNON', precioProveedor: 38.46, precioSugerido: 50.00 },
        { nombreProducto: 'FLAUTIN', precioProveedor: 41.67, precioSugerido: 50.00 },
        { nombreProducto: 'GALLETA', precioProveedor: 41.67, precioSugerido: 50.00 },
        { nombreProducto: 'SALVADO', precioProveedor: 45.83, precioSugerido: 55.00 },
        { nombreProducto: 'BIZCOCHO', precioProveedor: 53.85, precioSugerido: 70.00 },
        { nombreProducto: 'MONEDAS', precioProveedor: 58.33, precioSugerido: 70.00 }
    ];

    let respuesta = [];
    for (var i = 0; i < valores.length; i++) {
        let item = new Producto({
            nombreProducto: valores[i].nombreProducto,
            precioProveedor: valores[i].precioProveedor,
            precioSugerido: valores[i].precioSugerido
        });
        item.unidadesMedida.push('KG');
        item.save();
    }

    return res.status(400).json({
        ok: true,
        message: 'Los valores se cargaron correctamente'
    });
});

app.post('/conf/cargar_productos_norpan/', function(req, res) {

    for (var i in ProductosNorPan) {
        for (var j in ProductosNorPan[i].productos) {
            let item = new Producto({
                categoria: ProductosNorPan[i].categoria,
                subcategoria: ProductosNorPan[i].subcategoria,
                nombreProducto: ProductosNorPan[i].productos[j].nombreProducto,
                precioProveedor: ProductosNorPan[i].productos[j].precioProveedor,
                precioSugerido: ProductosNorPan[i].productos[j].precioSugerido
            });
            // console.log('producto a guardar');
            // console.log(item);
            item.unidadesMedida.push(ProductosNorPan[i].productos[j].unidadMedida);
            item.save((err, exito) => {
                if (err) {
                    console.log("salto un error en el alta del producto");
                    console.log(err.message);
                }

                Proveedor.findOneAndUpdate({ _id: '5b8aa0414795cc56a5539313' }, { $push: { productos: item._id } },
                    function(err2, success) {
                        if (err2) {
                            console.log('Salto un error en el push del producto al proveedor');
                            console.log(err2.message);
                        }

                    });
            });
        }

    }




    return res.json({
        ok: true,
        message: 'Los valores se cargaron correctamente'
    });
});










module.exports = app;