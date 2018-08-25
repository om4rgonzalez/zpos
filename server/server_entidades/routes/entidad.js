const express = require('express');
const app = express();

const Entidad = require('../models/entidad');
const funciones = require('../../middlewares/funciones');
const Domicilio = require('../../server_direccion/models/domicilio');


app.post('/entidad/nueva/', async function(req, res) {
    // console.log('Comienzo dando de alta el domicilio')
    let domicilio = Domicilio({
        pais: req.body.domicilio.pais,
        provincia: req.body.domicilio.provincia,
        localidad: req.body.domicilio.localidad,
        barrio: req.body.domicilio.barrio,
        calle: req.body.domicilio.calle,
        numeroCasa: req.body.domicilio.numeroCasa,
        piso: req.body.domicilio.piso,
        numeroDepartamento: req.body.domicilio.numeroDepartamento,
        latitud: req.body.domicilio.latitud,
        longitud: req.body.domicilio.longitud,
        codigoPostal: req.body.domicilio.codigoPostal
    });
    try {
        let respuestaDomicilio = await funciones.nuevoDomicilio(domicilio);
        if (respuestaDomicilio.ok) {
            //doy de alta la entidad
            let entidad = new Entidad({
                _id: req.body.entidad._id,
                cuit: req.body.entidad.cui,
                razonSocial: req.body.entidad.razonSocial,
                domicilio: domicilio._id,
                actividadPricipal: req.body.entidad.actividadPricipal,
                tipoPersoneria: req.body.entidad.tipoPersoneria
            });

            entidad.save((err, entidadDB) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }


                res.json({
                    ok: true,
                    entidadDB
                });
            });
        } else {
            return res.status(412).json({
                ok: false,
                message: 'Fallo la carga del domicilio'
            });
        }
    } catch (e) {
        return res.status(500).json({
            ok: false,
            message: 'Fallo la ejecucion de una funcion: ' + e.message
        });
    }

});


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




module.exports = app;