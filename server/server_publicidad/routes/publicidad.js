const express = require('express');
const app = express();
const Publicidad = require('../models/publicidad');
const fs = require('fs');
// const formidable = require('express-formidable');
// const Domicilio = require('../../server_direccion/models/domicilio');
// const bodyParser = require('body-parser');
const funciones = require('../../middlewares/funciones');
const aut = require('../../middlewares/autenticacion');


// app.use(formidable({
//     keepExtensions: true
//         // ,
//         // uploadDir: '/home/marcelo/Source/zpos/server/server_publicidad/imagenes/'
// }));

// let () => {
//     app.use(bodyParser.urlencoded({ extended: false }));
//     // parse application/json
//     app.use(bodyParser.json());
// };

app.post('/publicidad/subir_foto/', async function(req, res) {
    console.log(req.body.cuerpo);
    console.log(req.body.proveedor);
    console.log(req.body.fechaInicio);
    console.log(req.body.fechaFin);
    console.log(req.body.titulo);
    if ((req.body.cuerpo != undefined) && (req.body.proveedor != undefined) && (req.body.fechaInicio != undefined) && (req.body.fechaFin != undefined)) {
        let publicidad = new Publicidad({
            proveedor: req.body.proveedor,
            cuerpo: req.body.cuerpo,
            fechaInicio: req.body.fechaInicio,
            fechaFin: req.body.fechaFin,
            titulo: req.body.titulo,
            tieneImagen: false
        });

        if (req.body.imagen) {
            console.log('Hay imagen');
            if (req.body.extension == 'png' || req.body.extension == 'jpg' || req.body.extension == 'jpeg') {
                console.log('Paso la validacion de formato de imagen');
                var target_path = process.env.UrlImagen + publicidad._id + '.' + req.body.extension; // hacia donde subiremos nuestro archivo dentro de nuestro servidor
                // console.log('Path Destino: ' + target_path);
                await fs.writeFile(target_path, new Buffer(req.body.imagen, "base64"), async function(err) {
                    //Escribimos el archivo

                    if (err) {
                        console.log('La subida del archivo produjo un error: ' + err.message);
                        return {
                            ok: false
                        };
                    }
                    console.log('La imagen se termino de mover');
                    publicidad.tieneImagen = true;
                    publicidad.imagen = 'http://www.bintelligence.net/imagenes_publicidad/' + publicidad._id + '.' + req.body.extension;

                    console.log('Se esta por guardar la publicidad');
                    try {
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
                    } catch (e) {
                        console.log('Salida por el catch: ' + e.message);
                    }

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


    let publicaciones = [];
    let fecha = new Date();
    let dia = fecha.getDate().toString();
    let mes = fecha.getMonth().toString();
    let anio = fecha.getFullYear().toString();
    if (dia.length == 1)
        dia = '0' + dia;
    if (mes.length == 1)
        mes = '0' + mes;

    Publicidad.find()
        // .populate('proveedor')
        .populate({ path: 'proveedor', select: '_id', populate: { path: 'entidad' } })
        .where({ disponibilidad: 'TODA LA RED' })
        .sort({ fechaAlta: -1 })
        .exec((err, publicidades) => {
            if (err) {
                console.log('La busqueda produjo un error: ' + err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda produjo un error: ' + err.message
                });
            }

            if (publicidades.length == 0) {
                console.log('La consulta no arrojo resultados');
                return res.json({
                    ok: false,
                    message: 'La consulta no arrojo resultados'
                });
            }

            let hasta = publicidades.length;
            let i = 0;

            while (i < hasta) {
                let diaInicio = publicidades[i].fechaInicio.getDate().toString();
                if (diaInicio.length == 1)
                    diaInicio = '0' + diaInicio;
                let mesInicio = publicidades[i].fechaInicio.getMonth().toString();
                if (mesInicio.length == 1)
                    mesInicio = '0' + mesInicio;
                let anioInicio = publicidades[i].fechaInicio.getFullYear().toString();

                let diaFin = publicidades[i].fechaFin.getDate().toString();
                if (diaFin.length == 1)
                    diaFin = '0' + diaFin;
                let mesFin = publicidades[i].fechaFin.getMonth().toString();
                if (mesFin.length == 1)
                    mesFin = '0' + mesFin;
                let anioFin = publicidades[i].fechaFin.getFullYear().toString();

                let inicio = parseInt(anioInicio + mesInicio + diaInicio, 10);
                let fin = parseInt(anioFin + mesFin + diaFin, 10);
                let fechaActual = parseInt(anio + mes + dia, 10);
                // console.log('Fecha inicio: ' + inicio);
                // console.log('Fecha fin: ' + fin);
                // console.log('Fecha actual: ' + fechaActual);
                if ((inicio <= fechaActual) && (fin >= fechaActual)) {
                    // console.log('Se agrega un elemento a la coleccion');
                    publicaciones.push(publicidades[i]);
                }
                i++;
            }

            if (publicaciones.length == 0) {
                return res.json({
                    ok: false,
                    message: 'No hay publicaciones para mostrar'
                });
            }

            res.json({
                ok: true,
                publicaciones
            });
        });
});








module.exports = app;