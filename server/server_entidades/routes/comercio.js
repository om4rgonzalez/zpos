const express = require('express');
const app = express();

const Entidad = require('../models/entidad');
const funciones = require('../../middlewares/funciones');
const Comercio = require('../models/comercio');
const Usuario = require('../../server_usuario/models/usuario');
const Persona = require('../../server_persona/models/persona');
const HorarioAtencion = require('../models/horarioAtencion');
const Contacto = require('../../server_contacto/models/contacto');
const Login = require('../../server_usuario/models/login');
const Sesion = require('../../server_usuario/models/sesion');


app.post('/comercio/nuevo/', async function(req, res) {
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
            let comercio = new Comercio({
                entidad: entidad._id
            });
            if (req.body.contactos) {
                // console.log('Hay contactos para guardar');
                let contactos = [];
                for (var i in req.body.contactos) {
                    // console.log(req.body.contactos[i]);
                    let contacto = new Contacto({
                        tipoContacto: req.body.contactos[i].tipoContacto,
                        codigoPais: req.body.contactos[i].codigoPais,
                        codigoArea: req.body.contactos[i].codigoArea,
                        numeroCelular: req.body.contactos[i].numeroCelular,
                        numeroFijo: req.body.contactos[i].numeroFijo,
                        email: req.body.contactos[i].email
                    });
                    try {
                        // console.log('Contacto a guardar');
                        // console.log(contacto);
                        let respuesta = await funciones.nuevoContacto(contacto);
                        // console.log('Respuesta de la funcion guardar contacto: ' + respuesta.ok);
                        if (respuesta.ok) {
                            contactos.push(contacto._id);
                        }

                        // console.log('array de contactos antes de asignarselo al cliente: ' + contactos);
                    } catch (e) {
                        console.log('Error al guardar el contacto: ' + contacto);
                        console.log('Error de guardado: ' + e);
                        contactoGuardado = false;
                    }
                }
                comercio.contactos = contactos;
            }

            if (req.body.usuarios) {
                // console.log('usuarios');
                for (var i in req.body.usuarios) {
                    // console.log(req.body.usuarios[i]);
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
                        // console.log('Usuario creado');
                        usuarios.push(usuario._id);
                    } else
                        avanzar = false;
                }
            }
            if (req.body.usuarios)
                comercio.usuarios = usuarios;

            comercio.save((err, comercioDB) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }


                res.json({
                    ok: true,
                    comercioDB
                });
            });
        } else {
            return res.status(412).json({
                ok: false,
                message: 'Fallo el alta de entidad'
            });
        }
    } catch (e) {
        return res.status(500).json({
            ok: false,
            message: 'Fallo la ejecucion de una funcion: ' + e.message
        });
    }

});



app.post('/comercio/ingresar/', async function(req, res) {
    console.log('Parametros recibidos en el login comercio');
    console.log(req.body);

    let usuario_ = new Object({
        nombreUsuario: req.body.nombreUsuario,
        clave: req.body.clave,
        idPush: req.body.idPush
    });
    let resp = await funciones.login(usuario_);

    // console.log(resp);

    if (resp.ok) {
        // console.log(resp);
        let usuario = new Object({
            _id: resp._id,
            token: resp.token
        });

        // console.log(usuario);

        Comercio.find({})
            // .populate('entidad')
            .populate({ path: 'entidad', populate: { path: 'domicilio' } })
            // .populate('proveedores', 'entidad tiposEntrega')
            .populate({ path: 'proveedores', select: 'entidad tiposEntrega', populate: { path: 'entidad', populate: { path: 'domicilio' } } })
            .where('usuarios').in(usuario._id)
            .exec(async(err, comercioDB) => {

                if (err) {
                    console.log('Error al realizar la consulta. Error: ' + err.message);
                    return res.json({
                        ok: false,
                        message: 'Error al realizar la consulta. Error: ' + err.message,
                        comercioDB: null,
                        usuario: null
                    });
                }

                if (comercioDB.length == 0) {
                    console.log('El usuario no pertenece a un comercio')
                    return res.json({
                        ok: false,
                        message: 'Usuario o clave incorrecta',
                        comercioDB: null,
                        usuario: null
                    });
                }

                //busco el login del usuario
                let ok = true;
                let sesion = new Sesion({});

                let log = await funciones.buscarLoginUsuario(usuario._id);
                // console.log('La funcion de busqueda de sesion devolvio');
                // console.log(log);
                switch (log.error) {
                    case 0: //ya hizo login antes
                        console.log('Ya hizo un login previamente');
                        // console.log('Id login: ' + log.login);
                        // console.log('Id push: ' + parametros.idPush);
                        // console.log('Id de sesion: ' + sesion._id);
                        sesion.save((err, nuevoSesion) => {
                            if (err) {
                                console.log('Se produjo un error al guardar la sesion: ' + err.message);
                            } else {
                                console.log('Agregando la sesion: ' + nuevoSesion._id);
                                Login.findOneAndUpdate({ '_id': log.login._id, online: false }, {
                                        $set: {
                                            idPush: req.body.idPush,
                                            online: true
                                        },
                                        $push: {
                                            sesiones: nuevoSesion._id
                                        }
                                    },
                                    function(err_, logins) {
                                        if (err_) {
                                            console.log('Error en la actualizacion de login: ' + err_.message);
                                        } else {
                                            if (logins == null) {
                                                console.log('La sesion esta abierta');
                                            } else {
                                                console.log('Login encontrado');

                                                // logins.sesiones.push(sesion._id);
                                                // console.log(logins);
                                            }
                                        }
                                    });
                            }
                        });

                        break;
                    case 1: // error de busqueda
                        ok: false;

                        break;
                    case 2: // primer login
                        console.log('Primer login');

                        // console.log(sesion);
                        sesion.save();
                        let login = new Login({
                            usuario: usuario._id,
                            idPush: req.body.idPush
                        });
                        // console.log(login);
                        login.sesiones.push(sesion._id);
                        login.save();

                        break;
                }


                return res.json({
                    ok: true,
                    message: 'login correcto',
                    comercioDB,
                    usuario
                });

            });
    } else {
        return res.json({
            ok: false,
            message: 'Usuario o clave incorrecta',
            comercioDB: null,
            usuario: null
        });

    }
});

//la funcion busca el proveedor en la red del comercio
app.post('/comercio/buscar_proveedor/', async function(req, res) {

    Comercio.find({ '_id': req.body.comercio })
        // .where('proveedores').in(req.body.proveedor)
        .exec((err, comerciosDB) => {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'La busqueda arrojo un error: Error: ' + err.message
                });
            }

            if (!comerciosDB) {
                return res.json({
                    ok: false,
                    message: 'El comercio no tiene al proveedor en su red'
                });
            }
            for (var i in comerciosDB[0].proveedores) {
                if (comerciosDB[0].proveedores[i] == req.body.proveedor)
                    return res.json({
                        ok: true,
                        message: 'El proveedor forma parte de la red del comercio'
                    });

            }
            // console.log('proveedores:');
            // console.log(comerciosDB);
            // // console.log('_id comercio: ' + comerciosDB[0]._id);
            // // console.log(comerciosDB[0].proveedores)

            res.json({
                ok: false,
                message: 'El comercio no tiene al proveedor en su red'
            });

        });
});


app.post('/comercio/cargar_conf_domicilio/', async function(req, res) {



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

    try {
        domicilio.save();
        //debo actualizar el domicilio en la entidad


    } catch (e) {

    }



    // Comercio.find({ '_id': req.body.comercio })
    //     // .where('proveedores').in(req.body.proveedor)
    //     .exec((err, comerciosDB) => {
    //         if (err) {
    //             return res.json({
    //                 ok: false,
    //                 message: 'La busqueda arrojo un error: Error: ' + err.message
    //             });
    //         }

    //         if (!comerciosDB) {
    //             return res.json({
    //                 ok: false,
    //                 message: 'El comercio no tiene al proveedor en su red'
    //             });
    //         }
    //         for (var i in comerciosDB[0].proveedores) {
    //             if (comerciosDB[0].proveedores[i] == req.body.proveedor)
    //                 return res.json({
    //                     ok: true,
    //                     message: 'El proveedor forma parte de la red del comercio'
    //                 });

    //         }
    //         // console.log('proveedores:');
    //         // console.log(comerciosDB);
    //         // // console.log('_id comercio: ' + comerciosDB[0]._id);
    //         // // console.log(comerciosDB[0].proveedores)

    //         res.json({
    //             ok: false,
    //             message: 'El comercio no tiene al proveedor en su red'
    //         });

    //     });
});

app.post('/comercio/buscar_por_nombre/', async function(req, res) {

    var x = req.body.nombreComercio.trim().split(" ");
    var regex = x.join("|");
    var entidades = [];



    Entidad.find({ "razonSocial": { "$regex": regex, "$options": "i" } },
        function(err, docs) {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'La busqueda produjo un error. Err: ' + err.message
                });
            }
            if (docs.length == 0) {
                return res.json({
                    ok: false,
                    message: 'No hay un comercio con ese nombre'
                });
            }
            let hasta = docs.length;
            let i = 0;
            while (i < hasta) {
                entidades.push(docs[i]._id);
                i++;
            }
            Comercio.find({ entidad: { $in: entidades } })
                .populate('contactos')
                .populate({ path: 'entidad', populate: { path: 'domicilio' } })
                .exec((err2, comercios) => {
                    if (err2) {
                        return res.json({
                            ok: false,
                            message: 'La busqueda de comercio provoco un error: ' + err2.message
                        });
                    }
                    if (comercios.length == 0) {
                        return res.json({
                            ok: false,
                            message: 'No se encontraron coincidencias'
                        });
                    }
                    res.json({
                        ok: true,
                        comercios
                    });
                });
        });
});

app.get('/comercio/obtener_productos/', async function(req, res) {
    Comercio.find({ '_id': req.query.idComercio })
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
            // console.log(proveedorDB);
            // console.log(proveedorDB.productos);
            if (!proveedorDB[0].productos)
                return res.json({
                    ok: false,
                    message: 'El proveedor no tiene productos asociados'
                });

            let productos = proveedorDB[0].productos;
            return res.json({
                ok: true,
                productos
            });

        });
});

app.post('/comercio/buscar_comercio/', async function(req, res) {

    Comercio.findOne({ _id: req.body.idComercio })
        .populate({ path: 'entidad', populate: { path: 'domicilio' } })
        .exec(async(err, comercio) => {
            if (err) {
                console.log('La busqueda de un comercio por Id arrojo un error');
                console.log(err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de un comercio por Id arrojo un error',
                    comercio: null
                });
            }

            if (comercio == null) {
                console.log('La busqueda de comercio por id no produjo resultados');
                return res.json({
                    ok: false,
                    message: 'La busqueda de comercio por id no produjo resultados',
                    comercio: null
                });
            }

            res.json({
                ok: true,
                message: 'Proveedor encontrado',
                comercio
            });
        });
});



module.exports = app;