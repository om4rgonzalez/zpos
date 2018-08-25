const express = require('express');
const app = express();
const _ = require('underscore');
const Persona = require('../models/persona');
const aut = require('../../middlewares/autenticacion');

//busqueda de persona por dni
app.get('/persona', function(req, res) {



    Persona.find({ "dni": req.query.dni })
        // .populate('tipoDni', 'nombre')
        .populate('domicilio')
        .populate({ path: 'domicilio', populate: { path: 'estadoCasa' } })
        .exec((err, personaDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }


            // console.log("Se encontro el dni " + req.query.dni);
            res.json({
                ok: true,
                personaDB
            });

        });
})

//app.get('/persona/obtener_persona/', [verificaToken], function(req, res) {
app.post('/persona/obtener_persona/', async function(req, res) {

    let usuario = await aut.validarToken(req.body.token);

    if (!usuario) {
        return res.status(401).json({
            ok: false,
            message: 'Usuario no valido'
        });
    } else {
        Persona.find({ "dni": req.body.dni })
            // .populate('tipoDni', 'nombre')
            .populate('domicilio')
            .populate({ path: 'domicilio', populate: { path: 'estadoCasa' } })
            .exec((err, personaDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                if (personaDB.length == 0) {
                    return res.status(400).json({
                        ok: false,
                        message: 'No existe una persona con ese DNI'
                    });
                }

                if (!personaDB) {
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'Dni no registrado'
                        }
                    });
                }
                // console.log("Se encontro el dni " + req.query.dni);
                res.json({
                    ok: true,
                    personaDB
                });

            });
    }


})

//busqueda de persona por _id
app.get('/persona/:id', function(req, res) {


    Persona.findById(req.params.id)
        // .populate('tipoDni', 'nombre')
        .populate('domicilio')
        .populate({ path: 'domicilio', populate: { path: 'estadoCasa' } })
        .exec((err, personaDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!personaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No se encontra ninguna persona'
                    }
                });
            }
            // console.log("Se encontro el dni " + req.query.dni);
            res.json({
                ok: true,
                personaDB
            });

        });
})


app.post('/persona/nueva/', function(req, res) {
    let objeto = req.body;
    let persona = new Persona({
        _id: objeto._id,
        tipoDni: objeto.tipoDni,
        dni: objeto.dni,
        apellidos: objeto.apellidos,
        nombres: objeto.nombres,
        domicilio: objeto.domicilio,
        fechaNacimiento: objeto.fechaNacimiento
    });

    persona.save((err, PersonaDB) => {
        if (err) {
            // console.log("Error al dar de alta la persona: " + err);
            return res.status(400).json({
                ok: false,

                err
            });
        }

        res.json({
            ok: true,
            PersonaDB
        });
    });
})

//update de persona
app.put('/persona/actualizar/:id', function(req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ['apellidos', 'nombres', 'fechaNacimiento']);

    //Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
    Persona.findByIdAndUpdate(id, body, (err, PersonaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'No se pudo realizar la actualizacion'
            });
        }



        res.json({
            ok: true,
            message: 'La actualizacion se realizo correctamente'
        });

    })

});





module.exports = app;