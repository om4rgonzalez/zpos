const express = require('express');
const app = express();

const Entidad = require('../models/entidad');
const funciones = require('../../middlewares/funciones');
const Proveedor = require('../models/proveedor');
const PuntoVenta = require('../models/puntoVenta');
const Usuario = require('../../server_usuario/models/usuario');
const Persona = require('../../server_persona/models/persona');
const Comercio = require('../models/comercio');
const Contacto = require('../../server_contacto/models/contacto');


app.post('/proveedor/nuevo/', async function(req, res) {
    // console.log('Comienzo dando de alta el domicilio')
    //tengo que generar la entidad y el domicilio. Pasarle esa info al metodo de funciones
    //y generar los id en ese momento (solo el _id de entidad se genera aqui)
    var usuarios = [];
    var contactoGuardado = true;
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
                // console.log('Punto de venta creado');
                let proveedor = new Proveedor({
                    entidad: entidad._id
                });

                proveedor.puntosVenta.push(puntoVenta._id);
                if (req.body.tiposEntrega) {
                    for (var i in req.body.tiposEntrega) {
                        proveedor.tiposEntrega.push(req.body.tiposEntrega[i].nombreTipo);
                    }
                    // console.log('tipos de entrega cargados');
                }
                if (req.body.contactos) {
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
                            let respuesta = await funciones.nuevoContacto(contacto);
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
                    proveedor.contactos = contactos;
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

app.post('/proveedor/agregar_tipos_entrega/', async function(req, res) {
    let avanzar = true;
    Proveedor.find({ id_: req.body.idProveedor })
    exec((err, proveedorDB) => {
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

        for (var i in proveedorDB[0].tiposEntrega) {
            for (var j in req.body.tiposEntrega) {
                if (proveedorDB[0].tiposEntrega[i] == req.body.tiposEntrega[j].item) {
                    avanzar = false;
                }
            }
        }

        if (avanzar) {
            for (var j in req.body.tiposEntrega) {
                Proveedor.findOneAndUpdate({ _id: proveedorDB[0]._id }, { $push: { tiposEntrega: req.body.tiposEntrega[j].item } },
                    function(err, success) {});
            }
        }
    });
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

app.get('/proveedor/listar_todos/', async function(req, res) {

    Proveedor.find({}, 'tiposEntrega entidad _id')
        .populate({ path: 'entidad', populate: { path: 'domicilio' } })
        .populate('contactos')
        .exec((err, proveedorDB) => {

            if (err) {
                return res.json({
                    ok: false,
                    message: 'Error al realizar la consulta. Error: ' + err.message
                });
            }

            if (!proveedorDB) {
                return res.json({
                    ok: false,
                    err: {
                        message: 'No hay proveedores para mostrar'
                    }
                });
            }
            let proveedores = [];
            // console.log('Comercio a buscar: ' + req.query.idComercio);
            Comercio.find({ '_id': req.query.idComercio })
                .exec((err2, comercios) => {
                    if (err2) {
                        console.log('La busqueda de comercio devolvio un error. Error: ' + err2.message);
                        return res.json({
                            ok: false,
                            message: 'La busqueda de comercio devolvio un error. Error: ' + err2.message
                        });
                    }

                    if (!comercios) {
                        console.log('No hay resultados');
                        return res.json({
                            ok: false,
                            message: 'El id no pertenece a un comercio activo'
                        });
                    }

                    if (comercios.length == 0) {
                        console.log('No hay resultados');
                        return res.json({
                            ok: false,
                            message: 'El id no pertenece a un comercio activo'
                        });
                    }
                    // console.log('Comercio encontrado');
                    // console.log(comerci=os);
                    let cantidadProveedor = proveedorDB.length;
                    let i = 0;
                    while (i < cantidadProveedor) {
                        let agregar = true;
                        let cantidadRedComercio = comercios[0].proveedores.length;
                        let j = 0;
                        while (j < cantidadRedComercio) {
                            // console.log('id a comparar');
                            // console.log('resultado de proveedores: ' + proveedorDB[i]._id);
                            // console.log('cantidad caracteres: ' + proveedorDB[i]._id.length)
                            // console.log('resultado en la lista del comercio: ' + comercios[0].proveedores[j]._id);
                            // console.log('cantidad caracteres: ' + comercios[0].proveedores[j]._id.length)
                            if (proveedorDB[i]._id.toString() == comercios[0].proveedores[j]._id.toString()) {
                                // console.log('Agregar ahora vale false');
                                agregar = false;
                            }
                            j++;
                        }
                        // console.log('El while devolvio ' + agregar);
                        if (agregar)
                            proveedores.push(proveedorDB[i]);
                        i++;
                    }
                    return res.json({
                        ok: true,
                        proveedores
                    });

                });
        });
});


app.post('/proveedor/ingresar/', async function(req, res) {

    let usuario_ = new Object({
        nombreUsuario: req.body.nombreUsuario,
        clave: req.body.clave
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

        Proveedor.find({}, 'tiposEntrega entidad _id')
            .populate('entidad')
            .where('usuarios').in(usuario._id)
            .exec((err, proveedorDB) => {

                if (err) {
                    // console.log('Error al realizar la consulta. Error: ' + err.message);
                    return res.json({
                        ok: false,
                        message: 'Error al realizar la consulta. Error: ' + err.message
                    });
                }

                if (!proveedorDB) {
                    // console.log('No hay proveedores para mostrar')
                    return res.json({
                        ok: false,
                        err: {
                            message: 'No hay proveedores para mostrar'
                        }
                    });
                }


                return res.json({
                    ok: true,
                    proveedorDB,
                    usuario
                });

            });
    } else {
        return res.json({
            ok: false,
            message: 'Usuario o clave incorrecta'
        });

    }
});





module.exports = app;