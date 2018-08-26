const express = require('express');
const app = express();
const Producto = require('../models/producto');



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










module.exports = app;