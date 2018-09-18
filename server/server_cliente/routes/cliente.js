const express = require('express');
const app = express();
const { verificaToken, verifica_Permiso } = require('../middlewares/autenticacion');
const Contacto = require('../../server_contacto/models/contacto');
const Cliente = require('../models/cliente');
const Domicilio = require('../../server_direccion/models/domicilio');
const Persona = require('../../server_persona/models/persona');
// const Comercio = require('../models/comercio');
// const Referencia = require('../models/referencia');
const funciones = require('../../middlewares/funciones');
const aut = require('../../middlewares/autenticacion');



app.post('/cliente/nuevo/', async function(req, res) {
    let contactoGuardado = true;
    let avanzar = true;
    let usuario = await aut.validarToken(req.body.token);
    var contactos = [];

    if (!usuario) {
        return res.status(401).json({
            ok: false,
            message: 'Usuario no valido'
        });
    } else {

        // Cliente.find({idCliente: req.body.idCliente, plataforma: req.body.plataforma})
        //     .exec((err, clientes) => {

        //     });












        //existe la persona?
        if (req.body.persona._id == '0') {
            try {
                //genero el modelo de domicilio
                if (req.body.domicilio) {
                    let domicilio = new Domicilio({
                        pais: req.body.domicilio.pais,
                        provincia: req.body.domicilio.provincia,
                        localidad: req.body.domicilio.localidad,
                        barrio: req.body.domicilio.barrio,
                        calle: req.body.domicilio.calle,
                        numeroCasa: req.body.domicilio.numeroCasa,
                        piso: req.body.domicilio.piso,
                        numeroDepartamento: req.body.domicilio.numeroDepartamento,
                        latitud: req.body.domicilio.latitud,
                        longitud: req.body.domicilio.longitud
                    });
                    let respDomicilio = await funciones.nuevoDomicilio(domicilio);


                    if (respDomicilio.ok) {
                        req.body.persona.domicilio = domicilio._id;
                        avanzar = true;
                    } else
                        avanzar = false;
                    //genero el modelo de persona
                } else {
                    avanzar = false;
                }

                let persona = new Persona({
                    tipoDni: req.body.persona.tipoDni,
                    dni: req.body.persona.dni,
                    apellidos: req.body.persona.apellidos,
                    nombres: req.body.persona.nombres,
                    fechaNacimiento: req.body.persona.fechaNacimiento,
                    // domicilio: domicilio._id
                });
                if (avanzar) {
                    persona.domicilio = domicilio._id;
                } else
                    avanzar = true;
                try {
                    let respPersona = await funciones.nuevaPersona(persona);
                    if (respPersona.ok)
                        req.body.persona._id = persona._id;
                    else {
                        avanzar = false;
                        return res.status(400).json({
                            ok: false,
                            message: 'Error al dar de alta una persona. Dni duplicado'
                        });
                    }
                } catch (e) {
                    avanzar = false;
                }

            } catch (e) {
                avanzar = false;
            }
        }


        if (avanzar) {

            //la persona ya existe, hay que darle de alta a los contactos y al cliente
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
                    // console.log('Error al guardar el contacto: ' + contacto);
                    // console.log('Error de guardado: ' + e);
                    contactoGuardado = false;
                }
            }


            if (contactoGuardado) {

                //por ultimo, doy de alta al cliente
                // console.log(contactos);
                let cliente = new Cliente({
                    titular: req.body.persona._id,
                    tipoCliente: req.body.cliente.tipoCliente,
                    // referencia: req.body.cliente.referencia._id
                });
                // console.log('estos son los id de contacto que le voy cargar al cliente: ' + contactos);
                for (var i in contactos) {
                    // console.log('el cliente tiene este contacto: ' + contactos[i]);
                    cliente.contactos.push(contactos[i]);
                }
                if (req.body.cliente.referencia) {
                    cliente.referencias.push(req.body.cliente.referencia._id);
                }
                if (req.body.comercio) {
                    // console.log('asigno el comercio');
                    cliente.comercios.push(req.body.comercio._id);
                }
                cliente.save((err, clienteDB) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            err
                        });
                    }


                    res.json({
                        ok: true,
                        clienteDB
                    });
                });
            }
        } else
            res.json({
                ok: false,
                message: 'No se pudo generar el registro'
            });

    }
})

app.post('/cliente/todos/', async function(req, res) {
    let usuario = await aut.validarToken(req.body.token);

    if (!usuario) {
        return res.status(401).json({
            ok: false,
            message: 'Usuario no valido'
        });
    } else {
        usuario.url = '/cliente/todos/';
        let acceso = await aut.verifica_Permiso(usuario);

        if (!acceso) {
            return res.status(403).json({
                ok: false,
                message: 'Acceso denegado'
            });
        } else {
            // let idRol = usuario.precedencia;
            Cliente.find()
                .populate('contactos')
                .populate({ path: 'contactos', populate: { path: 'tipoContacto' } })
                .populate('titular')
                // .populate({ path: 'titular', populate: { path: 'tipoDni' } })
                .populate({ path: 'titular', populate: { path: 'domicilio' } })
                .populate('tipoCliente')
                .populate({
                    path: 'titular',
                    populate: { path: 'domicilio', populate: { path: 'estadoCasa' } }
                })
                .populate('referencias')
                .populate({ path: 'referencias', populate: { path: 'tipoReferencia' } })
                .populate({ path: 'referencias', populate: { path: 'itemsReferencia' } })
                .populate('comercios')
                .populate({ path: 'comercios', populate: { path: 'referencias' } })
                .populate({
                    path: 'comercios',
                    populate: { path: 'referencias', populate: { path: 'itemsReferencia' } }
                })
                .populate({
                    path: 'comercios',
                    populate: { path: 'referencias', populate: { path: 'tipoReferencia' } }
                })
                .where({ 'estado': true })
                .exec((err, clientes) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    }

                    if (!clientes) {
                        return res.status(400).json({
                            ok: false,
                            err: {
                                message: 'No hay clientes'
                            }
                        });
                    }

                    clientes = clientes.filter(function(clientes) {
                        return clientes.titular != null;
                    })

                    return res.json({
                        ok: true,
                        recordsTotal: clientes.length,
                        recordsFiltered: clientes.length,
                        clientes
                    });

                });
        }
    }
});

app.post('/cliente/buscar_por_dni/', async function(req, res) {
    let usuario = await aut.validarToken(req.body.token);

    if (!usuario) {
        return res.status(401).json({
            ok: false,
            message: 'Usuario no valido'
        });
    } else {
        usuario.url = '/cliente/buscar_por_dni/';
        let acceso = await aut.verifica_Permiso(usuario);

        if (!acceso) {
            return res.status(403).json({
                ok: false,
                message: 'Acceso denegado'
            });
        } else {
            let dni_ = req.body.dni;
            // console.log("dni buscado: " + dni_);
            Cliente.find()
                .populate('contactos')
                .populate({ path: 'contactos', populate: { path: 'tipoContacto' } })
                .populate({
                    path: 'titular',
                    match: { dni: { $eq: dni_ } }
                })
                // .populate({
                //     path: 'titular',
                //     populate: { path: 'tipoDni' },
                //     match: { dni: { $eq: dni_ } }
                // })
                .populate({
                    path: 'titular',
                    populate: { path: 'domicilio' },
                    match: { dni: { $eq: dni_ } }
                })
                .populate('tipoCliente')
                .populate({
                    path: 'titular',
                    populate: {
                        path: 'domicilio',
                        populate: { path: 'estadoCasa' }
                    },
                    match: { dni: { $eq: dni_ } }
                })
                .populate('referencias')
                .populate({ path: 'referencias', populate: { path: 'tipoReferencia' } })
                .populate({ path: 'referencias', populate: { path: 'itemsReferencia' } })
                .populate('comercios')
                .populate({ path: 'comercios', populate: { path: 'referencias' } })
                .populate({
                    path: 'comercios',
                    populate: { path: 'referencias', populate: { path: 'itemsReferencia' } }
                })
                .populate({
                    path: 'comercios',
                    populate: { path: 'referencias', populate: { path: 'tipoReferencia' } }
                })
                .where({ 'estado': true })
                .exec((err, clientes) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    }

                    clientes = clientes.filter(function(clientes) {
                        return clientes.titular != null;
                    })

                    if (clientes.length == 0) {
                        return res.status(400).json({
                            ok: false,
                            err: {
                                message: 'No hay clientes'
                            }
                        });
                    }



                    res.json({
                        ok: true,
                        recordsTotal: clientes.length,
                        recordsFiltered: clientes.length,
                        clientes
                    });

                });
        }
    }
})


app.delete('/cliente/deshabilitar/', async function(req, res) {
    let usuario = await aut.validarToken(req.body.token);
    if (!usuario) {
        return res.status(401).json({
            ok: false,
            message: 'Usuario no valido'
        });
    } else {
        usuario.url = '/cliente/deshabilitar/';
        let acceso = await aut.verifica_Permiso(usuario);

        if (!acceso) {
            return res.status(403).json({
                ok: false,
                message: 'Acceso denegado'
            });
        } else {
            let id = req.body.idCliente;
            // var fecha = new Date();
            let cambiaEstado = {
                estado: false
            };
            // console.log("id a buscar: " + id);
            Cliente.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, clienteBorrado) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                };

                if (!clienteBorrado) {
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'Usuario no encontrado'
                        }
                    });
                }

                res.json({
                    ok: true,
                    message: 'El cliente fue deshabilitado'
                });

            });
        }
    }
})


app.post('/cliente/combos/', async function(req, res) {
    let respuesta = await funciones.combosNuevoCliente();
    res.json({
        ok: true,
        respuesta
    });
});

app.post('/cliente/agregar_comercio/', async function(req, res) {
    let usuario = await aut.validarToken(req.body.token);
    let avanzar = true;
    if (!usuario) {
        return res.status(401).json({
            ok: false,
            message: 'Usuario no valido'
        });
    } else {
        usuario.url = '/cliente/agregar_comercio/';
        let acceso = await aut.verifica_Permiso(usuario);

        if (!acceso) {
            return res.status(403).json({
                ok: false,
                message: 'Acceso denegado'
            });
        } else {
            // console.log('Id comercio: ' + req.body.comercio._id);
            if (req.body.comercio._id == '0') {
                //primero guardo el domicilio comercial
                let domicilioComercial = new Domicilio({
                    pais: req.body.comercio.domicilio.pais,
                    provincia: req.body.comercio.domicilio.provincia,
                    localidad: req.body.comercio.domicilio.localidad,
                    barrio: req.body.comercio.domicilio.barrio,
                    calle: req.body.comercio.domicilio.calle,
                    numeroCasa: req.body.comercio.domicilio.numeroCasa,
                    piso: req.body.comercio.domicilio.piso,
                    numeroDepartamento: req.body.comercio.domicilio.numeroDepartamento,
                    latitud: req.body.comercio.domicilio.latitud,
                    longitud: req.body.comercio.domicilio.longitud,
                    estadoCasa: req.body.comercio.domicilio.estadoCasa
                });
                try {
                    let respDomicilioComercial = await funciones.nuevoDomicilio(domicilioComercial);
                    if (respDomicilioComercial.ok) {

                        ////// cargo la referencia /////////
                        if (req.body.comercio.referencia) {
                            try {
                                // console.log('Voy a crear el objeto referencia');
                                let referenciaComercio = new Referencia({
                                    tipoReferencia: req.body.comercio.referencia.tipoReferencia,
                                    comentario: req.body.comercio.referencia.comentario,
                                });
                                // console.log('Ya tengo el objeto referencia, ahora le agrego los items');
                                // console.log(req.body.comercio.referencia.itemsReferencia);
                                if (req.body.comercio.referencia.itemsReferencia) {
                                    // console.log('paso el if');
                                    for (var i in req.body.comercio.referencia.itemsReferencia) {
                                        // console.log('Item referencia: ' + req.body.comercio.referencia.itemsReferencia[i].item);
                                        referenciaComercio.itemsReferencia.push(req.body.comercio.referencia.itemsReferencia[i].item);
                                    }
                                }

                                // console.log('voy a guardar la referencia');
                                let respReferenciaComercio = await funciones.nuevaReferencia(referenciaComercio);
                                // console.log('referencia guardada');
                                if (respReferenciaComercio.ok)
                                    req.body.comercio.referencia._id = referenciaComercio._id;
                                else
                                    avanzar = false;
                            } catch (e) {
                                // console.log('Error al generar la referencia. Error: ' + e.message);
                                avanzar = false;
                            }
                        }
                        let comercio = new Comercio({
                            cuit: req.body.comercio.cuit,
                            razonSocial: req.body.comercio.razonSocial,
                            domicilio: domicilioComercial._id,
                            codigoActividad: req.body.comercio.codigoActividad,
                            descripcionActividad: req.body.comercio.descripcionActividad
                        });
                        if (req.body.comercio.referencia)
                            comercio.referencias.push(req.body.comercio.referencia._id);

                        try {
                            // console.log('llamando al servicio de alta de comercio');
                            let respComercio = await funciones.nuevoComercio(comercio);
                            if (respComercio.ok)
                                req.body.comercio._id = comercio._id;
                            else {
                                avanzar = false;
                                return res.status(400).json({
                                    ok: false,
                                    message: 'Error al crear el comercio. Cuit duplicado'
                                });
                            }
                        } catch (e) {
                            avanzar = false;
                        }
                    } else
                        avanzar = false;
                } catch (e) {
                    // console.log('error en el alta del domicilio. Error: ' + e.message + ' ' + e);
                    avanzar = false;
                }
            } else {
                //El comercio ya existe en la base de datos, solo agrego la referencia 
                ////// cargo la referencia /////////
                if (req.body.comercio.referencia) {
                    let referenciaComercio = new Referencia({
                        tipoReferencia: req.body.comercio.referencia.tipoReferencia,
                        comentario: req.body.comercio.referencia.comentario,
                    });
                    for (var i in req.body.comercio.referencia.itemsReferencia) {
                        // console.log('Items referencia: ' + req.body.comercio.referencia.itemsReferencia[i].item);
                        referenciaComercio.itemsReferencia.push(req.body.comercio.referencia.itemsReferencia[i].item);
                    }
                    try {
                        let respReferenciaComercio = await funciones.nuevaReferencia(referenciaComercio);
                        if (respReferenciaComercio.ok) {
                            //actualizo el comercio
                            let respuestaActualizacionComercio = await funciones.agregarReferencia(req.body.comercio._id, referenciaComercio._id);
                            if (!respuestaActualizacionComercio.ok)
                                avanzar = false;
                        } else
                            avanzar = false;
                    } catch (e) {
                        avanzar = false;
                    }
                }
            }



            if (avanzar) {
                //asigno el comercio al cliente
                Cliente.findOneAndUpdate({ _id: req.body.idCliente }, { $push: { comercios: req.body.comercio._id } },
                    function(err, success) {
                        if (err) {
                            return res.status(400).json({
                                ok: false,
                                err
                            });
                        }

                        res.json({
                            ok: true,
                            message: 'La operacion se completo con exito'
                        });


                    });
            }
        }
    }
});



app.post('/cliente/agregar_referencia/', async function(req, res) {
    let usuario = await aut.validarToken(req.body.token);
    let avanzar = true;
    if (!usuario) {
        return res.status(401).json({
            ok: false,
            message: 'Usuario no valido'
        });
    } else {
        usuario.url = '/cliente/agregar_referencia/';
        let acceso = await aut.verifica_Permiso(usuario);

        if (!acceso) {
            return res.status(403).json({
                ok: false,
                message: 'Acceso denegado'
            });
        } else {
            if (req.body.cliente.referencia) {

                let referencia = new Referencia({
                    tipoReferencia: req.body.cliente.referencia.tipoReferencia,
                    comentario: req.body.cliente.referencia.comentario,
                });
                for (var i in req.body.cliente.referencia.itemsReferencia) {
                    referencia.itemsReferencia.push(req.body.cliente.referencia.itemsReferencia[i].item);
                }
                try {
                    let respReferencia = await funciones.nuevaReferencia(referencia);
                    if (respReferencia.ok) {
                        req.body.cliente.referencia._id = referencia._id;
                    } else {
                        avanzar = false;
                    }
                } catch (e) {
                    avanzar = false;
                }

            } else
                avanzar = false;

            if (avanzar) {
                //asigno la referencia al cliente
                Cliente.findOneAndUpdate({ _id: req.body.cliente._id }, { $push: { referencias: req.body.cliente.referencia._id } },
                    function(err, success) {
                        if (err) {
                            return res.status(400).json({
                                ok: false,
                                err
                            });
                        }

                        res.json({
                            ok: true,
                            message: 'La operacion se completo con exito'
                        });


                    });
            }
        }
    }
});


module.exports = app;