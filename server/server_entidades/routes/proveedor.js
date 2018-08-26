const express = require('express');
const app = express();

const Entidad = require('../models/entidad');
const funciones = require('../../middlewares/funciones');
const Proveedor = require('../models/proveedor');
const PuntoVenta = require('../models/puntoVenta');
const Usuario = require('../../server_usuario/models/usuario');
const Persona = require('../../server_persona/models/persona');


app.post('/proveedor/nuevo/', async function(req, res) {
    // console.log('Comienzo dando de alta el domicilio')
    //tengo que generar la entidad y el domicilio. Pasarle esa info al metodo de funciones
    //y generar los id en ese momento (solo el _id de entidad se genera aqui)
    var usuarios = [];
    let domicilio = {
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
    };

    let entidad = Entidad({
        cuit: req.body.entidad.cuit,
        razonSocial: req.body.entidad.razonSocial,
        actividadPrincipal: req.body.entidad.actividadPrincipal,
        tipoPersoneria: req.body.entidad.tipoPersoneria
    });

    // console.log('Entidad antes de ser enviada a la funcion');

    // console.log(entidad);
    try {
        let respuestaEntidad = await funciones.nuevaEntidad(entidad, domicilio);
        // console.log('Entidad creada');
        if (respuestaEntidad.ok) {
            //doy de alta al punto de venta
            let puntoVenta = new PuntoVenta({
                nombrePuntoVenta: 'Casa Central',
                domicilio: respuestaEntidad.domicilio
            });
            let respuestaPunto = await funciones.nuevoPuntoVenta(puntoVenta);
            if (respuestaPunto.ok) {
                console.log('Punto de venta creado');
                let proveedor = new Proveedor();
                proveedor.puntosVenta.push(puntoVenta._id);
                if (req.body.tiposEntrega) {
                    for (var i in req.body.tiposEntrega) {
                        proveedor.tiposEntrega.push(req.body.tiposEntrega[i].nombreTipo);
                    }
                    console.log('tipos de entrega cargados');
                }
                if (req.body.usuarios) {
                    console.log('usuarios');
                    for (var i in req.body.usuarios) {
                        console.log(req.body.usuarios[i]);
                        let persona = new Persona({
                            tipoDni: req.body.usuarios[i].persona.tipoDni,
                            dni: req.body.usuarios[i].persona.dni,
                            apellidos: req.body.usuarios[i].persona.apellidos,
                            nombres: req.body.usuarios[i].persona.nombres
                        });
                        let usuario = new Usuario({
                            persona: persona,
                            nombreUsuario: req.body.usuarios[i].nombreUsuario,
                            clave: req.body.usuarios[i].clave,
                            rol: req.body.usuarios[i].rol
                        });
                        let respuestaUsuario = await funciones.nuevoUsuario(usuario);
                        if (respuestaUsuario.ok) {
                            console.log('Usuario creado');
                            usuarios.push(usuario._id);
                        } else
                            avanzar = false;
                    }
                }
                if (req.body.usuarios)
                    proveedor.usuarios = usuarios;
                proveedor.save((err, proveedorDb) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            err
                        });
                    }


                    res.json({
                        ok: true,
                        proveedorDb
                    });
                });
            }
        } else {
            return res.status(412).json({
                ok: false,
                message: 'Fallo la carga del punto de venta'
            });
        }



    } catch (e) {
        return res.status(500).json({
            ok: false,
            message: 'Fallo la ejecucion de una funcion: ' + e.message
        });
    }

});


app.get('/proveedor/obtener_productos/', async function(req, res) {
    Proveedor.find({ '_id': req.query.idProveedor })
        .populate('productos')
        .exec((err, proveedorDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!proveedorDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Error en la conexion a la base de datos'
                    }
                });
            }
            return res.json({
                ok: true,
                proveedorDB
            });

        });
})




module.exports = app;