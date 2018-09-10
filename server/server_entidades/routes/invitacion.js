const express = require('express');
const app = express();

const Invitacion = require('../models/invitacion');
const funciones = require('../../middlewares/funciones');
const Comercio = require('../../server_entidades/models/comercio');
// const Domicilio = require('../../server_direccion/models/domicilio');


app.post('/invitacion/nueva/', async function(req, res) {

    //verifico si el proveedor ya forma parte de la red del comercio
    let forma = await funciones.verificarExistenciaProveedorEnRedComercio(req.body.proveedor, req.body.comercio);
    // console.log('La funcion devuelve ' + forma.ok);
    if (forma.ok) {
        let invitacion = Invitacion({
            comercio: req.body.comercio,
            proveedor: req.body.proveedor,
            texto: req.body.texto
        });
        try {
            invitacion.save((err, invitacionDB) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                res.json({
                    ok: true,
                    message: 'La invitacion se envio con exito'
                });
            });

        } catch (e) {
            return res.json({
                ok: false,
                message: 'Fallo la ejecucion de una funcion: ' + e.message
            });
        }
    } else {
        return res.json({
            ok: false,
            message: 'El proveedor ya forma parte de la red del comercio'
        });
    }

});


app.get('/invitacion/consultar_pendientes/', async function(req, res) {
    console.log('El proveedor que consulta es: ' + req.query.proveedor);
    Invitacion.find({ proveedor: req.query.proveedor })
        .populate('comercio')
        .populate({ path: 'comercio', populate: { path: 'entidad' } })
        .populate({ path: 'comercio', populate: { path: 'entidad' }, populate: { path: 'domicilio' } })
        .where({ 'pendienteDeRevision': true })
        .exec((err, invitaciones) => {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'La busqueda produjo un error. Error: ' + err.message
                });
            }

            if (!invitaciones) {
                return res.json({
                    ok: false,
                    message: 'El proveedor no tiene invitaciones pendientes de revision'
                });
            }

            if (invitaciones.length == 0) {
                return res.json({
                    ok: false,
                    message: 'El proveedor no tiene invitaciones pendientes de revision'
                });
            }
            // console.log(invitaciones);



            res.json({
                ok: true,
                invitaciones
            });
        });
});


app.post('/invitacion/aceptar_rechazar/', async function(req, res) {
    let fecha = new Date();
    Invitacion.findByIdAndUpdate(req.body.idInvitacion, {
        $set: {
            aceptada: req.body.aceptada,
            fechaAceptada: fecha,
            pendienteDeRevision: false
        }
    }, async function(err, invitacionDB) {
        if (err) {

            return res.json({
                ok: false,
                message: 'No se pudo completar la operacion'
            });
        }

        if (!invitacionDB) {
            return res.json({
                ok: false,
                message: 'No se encontro la ivitacion'
            });
        }

        // console.log(invitacionDB);

        if (req.body.aceptada) {

            ////////////////////

            Comercio.findOneAndUpdate({ _id: invitacionDB.comercio }, { $push: { proveedores: invitacionDB.proveedor } },
                function(err2, success) {
                    if (err2) {
                        return res.json({
                            ok: false,
                            message: 'No se pudo completar la operacion. Error: ' + err2.message
                        });
                    }

                    return res.json({
                        ok: true,
                        message: 'La invitacion fue aceptada'
                    });


                });

            ////////////////////


            // Comercio.findOneAndUpdate(invitacionDB.comercio, { $push: { proveedores: invitacionDB.proveedor } });
        } else {
            return res.json({
                ok: true,
                message: 'La invitacion fue rechazada'
            });
        }


    });

});



module.exports = app;