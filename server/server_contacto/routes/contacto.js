const express = require('express');
const app = express();
const Contacto = require('../models/contacto');
const HistoriaCambios = require('../models/historiaCambio');




app.post('/contacto/nuevo/', function(req, res) {
    let objeto = req.body;
    let contacto = new Contacto({
        _id: objeto._id,
        tipoContacto: objeto.tipoContacto,
        codigoPais: objeto.codigoPais,
        codigoArea: objeto.codigoArea,
        numeroCelular: objeto.numeroCelular,
        numeroFijo: objeto.numeroFijo,
        email: objeto.email
    });

    // console.log("contacto a guardar: " + contacto);
    contacto.save((err, contactoDB) => {
        if (err) {
            // console.log("Salto un error en contacto.js: " + err);
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // console.log("Se guardo el contacto, ahora hay que guardar la historia");
        //guardo el nuevo contacto en el historial de cambios
        let historia = new HistoriaCambios({
            idContacto: contactoDB._id,
            tipoContacto: contactoDB.tipoContacto,
            codigoPais: contactoDB.codigoPais,
            codigoArea: contactoDB.codigoArea,
            numeroCelular: contactoDB.numeroCelular,
            numeroFijo: contactoDB.numeroFijo,
            email: contactoDB.email,
            numeroCambio: 1
        });

        historia.save((err, historiaDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }


            res.json({
                ok: true,
                contactoDB
            });
            // console.log("Se guardo la historia: " + res);

        });
    });
})

// app.put('/contacto', function(req, res) {
//     res.json('Modifica los datos de un usuario')
// })

// app.delete('/contacto', function(req, res) {
//     res.json('Cambia el estado de un usuario a "borrado"')
// })

module.exports = app;