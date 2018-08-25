const express = require('express');
const app = express();

const ActividadPrincipal = require('../../config/actividadesPrincipalesProveedores.json');


// app.post('/conf/inicializar_actividad_principal/', function(req, res) {
//     let valores = [{ nombreActividad: 'DESPENSA', orden: 1, tipoCliente: 1 },
//         { nombreActividad: 'KIOSCO', orden: 2, tipoCliente: 1 },
//         { nombreActividad: 'MINISUPER', orden: 3, tipoCliente: 1 },
//         { nombreActividad: 'DRUGSTORE', orden: 4, tipoCliente: 1 },
//         { nombreActividad: 'SANDWICHERIA', orden: 5, tipoCliente: 1 },
//         { nombreActividad: 'ROTISERIA', orden: 6, tipoCliente: 1 },
//         { nombreActividad: 'RESTAURANT', orden: 7, tipoCliente: 1 },
//         { nombreActividad: 'CARNICERIA', orden: 8, tipoCliente: 1 },
//         { nombreActividad: 'PANADERIA', orden: 9, tipoCliente: 1 },
//         { nombreActividad: 'HELADERIA', orden: 10, tipoCliente: 1 },
//         { nombreActividad: 'OTRO', orden: 1000, tipoCliente: 1 },
//         { nombreActividad: 'PROVEEDOR DE PRODUCTOS COMESTIBLES', orden: 1 },
//         { nombreActividad: 'PROVEEDOR DE PRODUCTOS PANADERIA', orden: 2, tipoCliente: 2 },
//         { nombreActividad: 'PROVEEDOR DE PRODUCTOS BEBIDAS', orden: 3, tipoCliente: 2 },
//         { nombreActividad: 'PROVEEDOR DE PRODUCTOS AVICOLAS', orden: 4, tipoCliente: 2 },
//         { nombreActividad: 'PROVEEDOR DE PRODUCTOS CARNES', orden: 5, tipoCliente: 2 },
//         { nombreActividad: 'PROVEEDOR DE PRODUCTOS FIAMBRES', orden: 6, tipoCliente: 2 },
//         { nombreActividad: 'PROVEEDOR DE PRODUCTOS LACTEOS', orden: 7, tipoCliente: 2 },
//         { nombreActividad: 'PROVEEDOR DE PRODUCTOS GOLOSINAS', orden: 8, tipoCliente: 2 },
//         { nombreActividad: 'PROVEEDOR DE PRODUCTOS PAPELERÍA Y DESCARTABLES', orden: 9, tipoCliente: 2 },
//         { nombreActividad: 'PROVEEDOR DE PRODUCTOS FRUTAS Y VERDURAS', orden: 10, tipoCliente: 2 },
//         { nombreActividad: 'PROVEEDOR DE PRODUCTOS GAS', orden: 11, tipoCliente: 2 },
//         { nombreActividad: 'PROVEEDOR DE PRODUCTOS LIMPIEZA E HIGIENE', orden: 12, tipoCliente: 2 },
//         { nombreActividad: 'PROVEEDOR DE SERVICIOS DESINFECCION', orden: 13, tipoCliente: 2 },
//         { nombreActividad: 'PROVEEDOR DE SERVICIOS LIMPIEZA', orden: 14, tipoCliente: 2 },
//         { nombreActividad: 'OTRO', orden: 1001, tipoCliente: 2 },
//     ];

//     let respuesta = [];
//     for (var i = 0; i < valores.length; i++) {
//         let item = new ActividadPrincipal({
//             nombreActividad: valores[i].nombreActividad,
//             orden: valores[i].orden,
//             tipoCliente: valores[i].tipoCliente
//         });
//         item.save();
//     }

//     return res.status(400).json({
//         ok: true,
//         message: 'Los valores se cargaron correctamente'
//     });
// });


// app.get('/conf/actividades/', async function(req, res) {
//     ActividadPrincipal.find()
//         .sort({ "orden": 1 })
//         .where({ 'activo': true })
//         .exec((err, actividades) => {
//             if (err) {
//                 return res.status(500).json({
//                     ok: false,
//                     err
//                 });
//             }

//             if (!actividades) {
//                 return res.status(400).json({
//                     ok: false,
//                     err: {
//                         message: 'Error en la conexion a la base de datos'
//                     }
//                 });
//             }
//             return res.json({
//                 ok: true,
//                 recordsTotal: actividades.length,
//                 recordsFiltered: actividades.length,
//                 actividades
//             });

//         });
// })

app.get('/conf/actividades_principales/', function(req, res) {

    res.json(ActividadPrincipal);
})




module.exports = app;