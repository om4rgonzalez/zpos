const express = require('express');
const app = express();
const Publicidad = require('../models/publicidad');
const fs = require('fs');
// const Domicilio = require('../../server_direccion/models/domicilio');
// const Persona = require('../../server_persona/models/persona');
const funciones = require('../../middlewares/funciones');
const aut = require('../../middlewares/autenticacion');

app.post('/publicidad/subir_foto/', async function(req, res) {
    // console.log(req.fields.cuerpo);
    // console.log(req.fields.proveedor);
    // console.log(req.fields.fechaInicio);
    // console.log(req.fields.fechaFin);
    if ((req.fields.cuerpo != undefined) && (req.fields.proveedor != undefined) && (req.fields.fechaInicio != undefined) && (req.fields.fechaFin != undefined)) {
        let publicidad = new Publicidad({
            proveedor: req.fields.proveedor,
            cuerpo: req.fields.cuerpo,
            fechaInicio: req.fields.fechaInicio,
            fechaFin: req.fields.fechaFin,
            titulo: req.fields.titulo,
            tieneImagen: false
        });

        if (req.files.imagen) {
            console.log('Hay imagen');
            var tmp_path = req.files.imagen.path; //ruta del archivo
            var tipo = req.files.imagen.type; //tipo del archivo
            if (tipo == 'image/png' || tipo == 'image/jpg' || tipo == 'image/jpeg') {
                console.log('Paso la validacion de formato de imagen');
                var target_path = process.env.UrlImagen + publicidad._id + '.' + req.files.imagen.name.split(".").pop(); // hacia donde subiremos nuestro archivo dentro de nuestro servidor
                // console.log('Path Destino: ' + target_path);
                await fs.rename(tmp_path, target_path, async function(err) {
                    //Escribimos el archivo

                    if (err) {
                        console.log('La subida del archivo produjo un error: ' + err.message);
                        return {
                            ok: false
                        };
                    }
                    console.log('La imagen se termino de mover');
                    publicidad.tieneImagen = true;
                    publicidad.imagen = 'http://www.bintelligence.net/imagenes_publicidad/' + publicidad._id + '.' + req.files.imagen.name.split(".").pop();

                    console.log('Se esta por guardar la publicidad');
                    publicidad.save((error, publicidad_) => {
                        if (error) {
                            console.log('El alta de la publicidad produjo un error: ' + error.message);
                            return res.json({
                                ok: false,
                                message: 'El alta de la publicidad produjo un error: ' + error.message
                            });
                        }
                        console.log('Publicidad guardada');
                        res.json({
                            ok: true,
                            message: 'La publicidad se cargo correctamente'
                        });
                    });

                });
            } else {
                return {
                    ok: false,
                    message: 'Formato de archivo no soportado'
                };
            }
        } else {
            console.log('Se esta por guardar la publicidad');
            publicidad.save((error, publicidad_) => {
                if (error) {
                    console.log('El alta de la publicidad produjo un error: ' + error.message);
                    return res.json({
                        ok: false,
                        message: 'El alta de la publicidad produjo un error: ' + error.message
                    });
                }
                console.log('Publicidad guardada');
                res.json({
                    ok: true,
                    message: 'La publicidad se cargo correctamente'
                });
            });
        }


    } else {
        res.json({
            ok: false,
            message: 'Se deben cargar todos los campos obligatorios'
        });
    }



});



app.post('/publicidad/obtener_publicidad/', async(req, res) => {
    // Publicidad.find({
    //     $and: [
    //         { $or: [{a: 1}, {b: 1}] },
    //         { $or: [{c: 1}, {d: 1}] }
    //     ]
    // }, function (err, results) {
    //     ...
    // }




    Publicidad.find()
        .where({ disponibilidad: 'TODA LA RED' })
        .exec((err, publicaciones) => {
            if (err) {
                console.log('La busqueda produjo un error: ' + err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda produjo un error: ' + err.message
                });
            }

            if (publicaciones.length == 0) {
                console.log('La consulta no arrojo resultados');
                return res.json({
                    ok: false,
                    message: 'La consulta no arrojo resultados'
                });
            }

            res.json({
                ok: true,
                publicaciones
            });
        });
});








module.exports = app;