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
const Login = require('../../server_usuario/models/login');
const Sesion = require('../../server_usuario/models/sesion');
const ImagenProveedor = require('../models/imagenProveedor');
const VideoProveedor = require('../models/videoProveedor');
const Cobertura = require('../models/cobertura');


app.post('/proveedor/nuevo/', async function(req, res) {
    // console.log('Comienzo dando de alta el domicilio')
    //tengo que generar la entidad y el domicilio. Pasarle esa info al metodo de funciones
    //y generar los id en ese momento (solo el _id de entidad se genera aqui)
    var usuarios = [];
    var contactoGuardado = true;
    let domicilio = {
        pais: req.body.domicilio.pais.toUpperCase(),
        provincia: req.body.domicilio.provincia.toUpperCase(),
        localidad: req.body.domicilio.localidad.toUpperCase(),
        barrio: req.body.domicilio.barrio.toUpperCase(),
        calle: req.body.domicilio.calle.toUpperCase(),
        numeroCasa: req.body.domicilio.numeroCasa,
        piso: req.body.domicilio.piso,
        numeroDepartamento: req.body.domicilio.numeroDepartamento,
        latitud: req.body.domicilio.latitud,
        longitud: req.body.domicilio.longitud,
        codigoPostal: req.body.domicilio.codigoPostal
    };

    let entidad = Entidad({
        cuit: req.body.entidad.cuit,
        razonSocial: req.body.entidad.razonSocial.toUpperCase(),
        actividadPrincipal: req.body.entidad.actividadPrincipal.toUpperCase(),
        tipoPersoneria: req.body.entidad.tipoPersoneria.toUpperCase()
    });

    // console.log('Entidad antes de ser enviada a la funcion');

    // console.log(entidad);
    try {
        let respuestaEntidad = await funciones.nuevaEntidad(entidad, domicilio);
        console.log('Entidad creada');
        console.log('Id de entidad: ' + respuestaEntidad);
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
                    entidad: respuestaEntidad._id
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

app.post('/proveedor/listar_todos_/', async function(req, res) {
    let hoy = new Date();
    Proveedor.find({}, 'tiposEntrega entidad _id')
        .populate({ path: 'entidad', populate: { path: 'domicilio' } })
        .populate('contactos')
        // Project.populate(project, [{path: 'galleries', match: {status: {$ne: 'published'}}}
        .populate({
            path: 'red',
            match: { comercio: { $ne: req.body.idComercio } }
        })
        .populate('imagenes')
        .populate('videos')
        .select('_id entidad red contactos imagenes videos')
        .exec(async(err, proveedores) => {

            if (err) {
                return res.json({
                    ok: false,
                    message: 'Error al realizar la consulta. Error: ' + err.message,
                    cantidadRegistros: 0,
                    proveedores: null
                });
            }

            if (!proveedores) {
                return res.json({
                    ok: false,
                    message: 'No hay proveedores para mostrar',
                    cantidadRegistros: 0,
                    proveedores: null
                });
            }

            // console.log('Antes del fitro hay ' + proveedores.length + ' elementos');

            // proveedores = proveedores.filter(function(proveedores) {
            //     return proveedores.red.length != 0;
            // });

            let proveedoresNoFrecuentes = [];
            let proveedoresFrecuentes = [];
            let proveedores_ = [];
            let respuestaFrecuentes = await funciones.buscarProveedoresFrecuentes(req.body.idComercio);
            if (respuestaFrecuentes.ok == 0) {
                //la funcion devolvio proveedores frecuentes
                for (var j in respuestaFrecuentes.proveedores) {
                    respuestaFrecuentes.proveedores[j].esFrecuente = true;
                    proveedoresFrecuentes.push(respuestaFrecuentes.proveedores[j]);
                }
            }

            let i = 0;
            let hasta = proveedores.length;
            // console.log('Hay ' + hasta + ' elementos');
            while (i < hasta) {
                //reviso que el comercio no sea frecuente
                let pertenece = false;
                for (var j in proveedoresFrecuentes) {
                    if (proveedoresFrecuentes[j]._id == proveedores[i]._id) {
                        pertenece = true;
                        break;
                    }
                }
                if (!pertenece) {
                    // console.log('');
                    // console.log(hoy + ' Agregando el proveedor: ' + proveedores[i].entidad.razonSocial);
                    let p = {
                        _id: proveedores[i]._id,
                        esFrecuente: false,
                        entidad: proveedores[i].entidad,
                        red: proveedores[i].red,
                        contactos: proveedores[i].contactos,
                        imagenes: proveedores[i].imagenes,
                        videos: proveedores[i].videos
                    };
                    proveedoresNoFrecuentes.push(p);
                }
                i++;
            }

            for (var k in proveedoresFrecuentes) {
                proveedores_.push(proveedoresFrecuentes[k]);
            }

            for (var k in proveedoresNoFrecuentes) {
                proveedores_.push(proveedoresNoFrecuentes[k]);
            }

            res.json({
                ok: true,
                message: 'Devolviendo proveedores',
                cantidadRegistros: proveedores_.length,
                proveedores: proveedores_
            });

        });
});

app.post('/proveedor/consultar_proveedores_frecuentes/', async function(req, res) {

    //{ proveedores: { $in: req.query.idProveedor } }
    let hoy = new Date();
    let proveedores_ = [];
    Proveedor.find()
        .populate({ path: 'entidad', populate: { path: 'domicilio' } })
        .populate('contactos')
        .populate({
            path: 'red',
            match: { comercio: req.body.idComercio }
        })
        .populate('imagenes')
        .populate('videos')
        .select('_id entidad red contactos imagenes videos')
        .exec(async(err, proveedores) => {
            if (err) {
                console.log(hoy + ' La consulta de proveedores recurrentes arrojo un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: 2,
                    message: 'La consulta de proveedores recurrentes arrojo un error',
                    proveedores: null
                });
            }

            if (proveedores.length == 0) {
                console.log(hoy + ' No hay aproveedores recurrentes');
                return res.json({
                    ok: 1,
                    message: 'No hay proveedores recurrentes',
                    proveedores: null
                });
            }
            // let j = 0;
            // let k = proveedores.length;
            // while (j < k) {
            //     console.log(proveedores[j]);
            //     j++;
            // }

            proveedores = proveedores.filter(function(proveedores) {
                return proveedores.red.length != 0;
            });

            if (proveedores.length == 0) {
                console.log(hoy + ' No hay aproveedores recurrentes');
                return res.json({
                    ok: 1,
                    message: 'No hay proveedores recurrentes',
                    proveedores: null
                });
            }

            //tengo que ordenar la lista de proveedores frecuentes por la cantidad de pedidos realizados
            // let i = 0;
            // let hasta = proveedores.length;
            // let temp = [];
            proveedores_ = await proveedores.sort(function(a, b) {
                return (b.red.cantidadPedidos - a.red.cantidadPedidos)
            });

            // while (i < hasta) {
            //     i++;
            // }

            return res.json({
                ok: 0,
                message: 'El comercio tiene proveedores recurrentes',
                proveedores: proveedores_
            });
        })

});



app.post('/proveedor/ingresar/', async function(req, res) {

    let hoy = new Date();
    console.log(hoy + ' Parametros recibidos en el login proveedor');
    console.log(hoy + ' ' + req.body);

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

        Proveedor.find({}, 'tiposEntrega entidad _id')
            .populate('entidad')
            .where('usuarios').in(usuario._id)
            .exec(async(err, proveedorDB) => {

                if (err) {
                    // console.log('Error al realizar la consulta. Error: ' + err.message);
                    return res.json({
                        ok: false,
                        message: 'Error al realizar la consulta. Error: ' + err.message
                    });
                }

                if (proveedorDB.length == 0) {
                    console.log(hoy + ' El usuario no pertenece a un proveedor')
                    return res.json({
                        ok: false,
                        err: {
                            message: 'No hay proveedores para mostrar'
                        }
                    });
                }
                // console.log('Los proveedores que se encontraron con ese usuario son:');
                // console.log(proveedorDB);

                //busco el login del usuario
                let ok = true;
                let sesion = new Sesion({});
                // console.log('Id de usuario a buscar: ' + usuario._id);
                let log = await funciones.buscarLoginUsuario(usuario._id);
                // console.log('La funcion de busqueda de sesion devolvio');
                // console.log(log);
                switch (log.error) {
                    case 0: //ya hizo login antes
                        console.log(hoy + ' Ya hizo un login previamente');
                        // console.log('Id login: ' + log.login);
                        // console.log('Id push: ' + parametros.idPush);
                        // console.log('Id de sesion: ' + sesion._id);
                        sesion.save((err, nuevoSesion) => {
                            if (err) {
                                console.log(hoy + ' Se produjo un error al guardar la sesion: ' + err.message);
                            } else {
                                console.log(hoy + ' Agregando la sesion: ' + nuevoSesion._id);
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
                                            console.log(hoy + ' Error en la actualizacion de login: ' + err_.message);
                                        } else {
                                            if (logins == null) {
                                                console.log(hoy + ' La sesion esta abierta');
                                            } else {
                                                console.log(hoy + ' Login encontrado');

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
                        console.log(hoy + ' Primer login');

                        // console.log(sesion);
                        sesion.save();
                        let login = new Login({
                            usuario: usuario._id,
                            idPush: req.body.idPush,
                            nombreUsuario: req.body.nombreUsuario,
                            entidad: proveedorDB[0].entidad.razonSocial,
                            esProveedor: true
                        });
                        // console.log(login);
                        login.sesiones.push(sesion._id);
                        login.save();

                        break;
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

//la funcion busca el proveedor en la red del comercio
app.post('/proveedor/buscar_proveedor_en_red/', async function(req, res) {

    Proveedor.find({ '_id': req.body.proveedor })
        .populate('red')
        .exec((err, proveedores) => {
            if (err) {
                return res.json({
                    ok: false,
                    message: 'La busqueda arrojo un error: Error: ' + err.message
                });
            }

            if (!proveedores) {
                return res.json({
                    ok: false,
                    message: 'El comercio no tiene al proveedor en su red'
                });
            }
            for (var i in proveedores[0].red) {
                console.log('Comercio a analizar: ' + proveedores[0].red[i].comercio);
                console.log('Comercio a buscar: ' + req.body.comercio);
                if (proveedores[0].red[i].comercio == req.body.comercio)
                    return res.json({
                        ok: true,
                        message: 'El proveedor ya forma parte de la red'
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

app.post('/proveedor/buscar_proveedor/', async function(req, res) {

    Proveedor.findOne({ _id: req.body.idProveedor })
        .populate({ path: 'entidad', populate: { path: 'domicilio' } })
        .exec(async(err, proveedor) => {
            if (err) {
                console.log('La busqueda de un proveedor por Id arrojo un error');
                console.log(err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de un proveedor por Id arrojo un error',
                    proveedor: null
                });
            }

            if (proveedor == null) {
                console.log('La busqueda de proveedor por id no produjo resultados');
                return res.json({
                    ok: false,
                    message: 'La busqueda de proveedor por id no produjo resultados',
                    proveedor: null
                });
            }

            res.json({
                ok: true,
                message: 'Proveedor encontrado',
                proveedor
            });
        });
});


app.post('/proveedor/buscar_alias/', async function(req, res) {
    Proveedor.findOne({ _id: req.body.idProveedor })
        .populate('red')
        .exec(async(err, proveedor) => {
            if (err) {
                console.log('La busqueda de proveedor para buscar un alias devolvio un error');
                console.log(err.message);
                return res.json({
                    ok: false,
                    message: 'La busqueda de proveedor para buscar un alias devolvio un error',
                    alias: null,
                    idAlias: null
                });
            }

            if (proveedor == null) {
                console.log('La busqueda de proveedor para buscar el alias no devolvio resultados');
                return res.json({
                    ok: false,
                    message: 'La busqueda de proveedor para buscar el alias no devolvio resultados',
                    alias: null,
                    idAlias: null
                });
            }

            let i = 0;
            let hasta = proveedor.red.length;
            let alias = '';
            let idAlias = '';
            // console.log('Buscando alias para el comercio: ' + req.body.idComercio);
            while (i < hasta) {
                // console.log('Comparando');
                // console.log('valor de i: ' + i);
                // console.log('Valor de hasta: ' + hasta);
                // console.log('Parametro a buscar: ' + req.body.idComercio);
                // console.log('Parametro de comparacion: ' + proveedor.red[i].comercio);
                if (req.body.idComercio == proveedor.red[i].comercio) {
                    alias = proveedor.red[i].alias;
                    idAlias = proveedor.red[i]._id;
                    break;
                }
                i++;
            }
            // console.log('Devolviendo el alias: ' + alias);

            res.json({
                ok: true,
                message: 'Alias encontrado',
                alias: alias,
                idAlias: idAlias
            });
        });
});


// app.get('/proveedor/consultar_comercios_de_proveedor/', async function(req, res) {

//     Comercio.find({ proveedores: { $in: req.query.idProveedor } })
//         .populate({ path: 'entidad', populate: { path: 'domicilio' } })
//         .populate('contactos')
//         // .where({proveedores: $in})
//         .exec(async(err, comercios) => {
//             if (err) {
//                 console.log('La busqueda de comercios para devolver todos los que tiene un proveedor devolvio un error');
//                 console.log(err.message);
//                 return res.json({
//                     ok: false,
//                     message: 'La busqueda de comercios para devolver todos los que tiene un proveedor devolvio un error',
//                     comercios: null
//                 });
//             }

//             if (comercios.length == 0) {
//                 console.log('La busqueda de comercios para devolver todos los que tiene un proveedor no devolvio resultados');
//                 return res.json({
//                     ok: false,
//                     message: 'La busqueda de comercios para devolver todos los que tiene un proveedor no devolvio resultados',
//                     comercios: null
//                 });
//             }

//             let i = 0;
//             let hasta = comercios.length;
//             let comercios_ = [];

//             while (i < hasta) {
//                 //buscar alias
//                 // console.log('Se esta por buscar el alias del comercio: ' + comercios[i]._id);
//                 let alias = await funciones.buscarAlias(req.query.idProveedor, comercios[i]._id);
//                 // console.log('La consulta de alias devolvio');
//                 // console.log(alias);
//                 let alias_ = '-';
//                 if (alias.ok) {
//                     if (alias.alias != null) {
//                         if (alias.alias != '') {
//                             alias_ = alias.alias;
//                         }
//                     }
//                 }
//                 // console.log('Cargando el alias: ' + comercios[i].alias);
//                 comercios_.push({
//                     vende: comercios[i].vende,
//                     primerLogin: comercios[i].primerLogin,
//                     aceptoTerminoProveedor: comercios[i].aceptoTerminoProveedor,
//                     aceptoTerminosVendedor: comercios[i].aceptoTerminosVendedor,
//                     horarioAtencion: comercios[i].horarioAtencion,
//                     contactos: comercios[i].contactos,
//                     _id: comercios[i]._id,
//                     fechaAlta: comercios[i].fechaAlta,
//                     entidad: comercios[i].entidad,
//                     alias: alias_
//                 });
//                 // comercios_.push(comercios[i]);

//                 i++;
//             }

//             // console.log('Busqueda de alias finalizada, el array de comercios vale');
//             // i = 0;
//             // hasta = comercios_.length;
//             // while (i < hasta) {
//             //     console.log(comercios_[i].alias);
//             //     i++;
//             // }

//             // console.log(comercios_);

//             res.json({
//                 ok: true,
//                 message: 'Comercios encontrados',
//                 comercios: comercios_
//             });

//             // res.json({
//             //     ok: true,
//             //     message: 'Comercios encontrados',
//             //     comercios
//             // });

//         });



// });

app.get('/proveedor/consultar_comercios_de_proveedor/', async function(req, res) {
    let hoy = new Date();
    Proveedor.find({ _id: req.query.idProveedor })
        .populate({
            path: 'red',
            populate: {
                path: 'comercio',
                select: 'contactos entidad _id fechaAlta',
                populate: { path: 'entidad', populate: { path: 'domicilio' } }
            }
        })
        .populate({
            path: 'red',
            populate: {
                path: 'comercio',
                select: 'contactos entidad _id fechaAlta',
                populate: {
                    path: 'contactos',
                    match: { tipoContacto: "Telefono Celular" }
                }
            }
        })
        .exec(async(err, proveedores) => {
            if (err) {
                console.log(hoy + ' Error en la consulta de proveedores para devolver los miembros de la red');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'Error en la consulta de proveedores para devolver los miembros de la red',
                    cantidadComercios: 0,
                    comercios: null
                });
            }

            if (proveedores.length == 0) {
                console.log(hoy + ' No hay proveedores con el id ' + req.query.idProveedor);
                return res.json({
                    ok: false,
                    message: ' No hay proveedores con el id ' + req.query.idProveedor,
                    cantidadComercios: 0,
                    comercios: null
                });
            }

            if (proveedores[0].red.length == 0) {
                return res.json({
                    ok: false,
                    message: 'El proveedor no tiene comercios en su red',
                    cantidadComercios: 0,
                    comercios: null
                });
            }

            return res.json({
                ok: true,
                message: 'Devolviendo red de comercios',
                cantidadComercios: proveedores[0].red.length,
                comercios: proveedores[0].red
            });
        });

    // Comercio.find({ proveedores: { $in: req.query.idProveedor } })
    //     .populate({ path: 'entidad', populate: { path: 'domicilio' } })
    //     .populate('contactos')
    //     // .where({proveedores: $in})
    //     .exec(async(err, comercios) => {
    //         if (err) {
    //             console.log('La busqueda de comercios para devolver todos los que tiene un proveedor devolvio un error');
    //             console.log(err.message);
    //             return res.json({
    //                 ok: false,
    //                 message: 'La busqueda de comercios para devolver todos los que tiene un proveedor devolvio un error',
    //                 comercios: null
    //             });
    //         }

    //         if (comercios.length == 0) {
    //             console.log('La busqueda de comercios para devolver todos los que tiene un proveedor no devolvio resultados');
    //             return res.json({
    //                 ok: false,
    //                 message: 'La busqueda de comercios para devolver todos los que tiene un proveedor no devolvio resultados',
    //                 comercios: null
    //             });
    //         }

    //         let i = 0;
    //         let hasta = comercios.length;
    //         let comercios_ = [];

    //         while (i < hasta) {
    //             //buscar alias
    //             // console.log('Se esta por buscar el alias del comercio: ' + comercios[i]._id);
    //             let alias = await funciones.buscarAlias(req.query.idProveedor, comercios[i]._id);
    //             // console.log('La consulta de alias devolvio');
    //             // console.log(alias);
    //             let alias_ = '-';
    //             if (alias.ok) {
    //                 if (alias.alias != null) {
    //                     if (alias.alias != '') {
    //                         alias_ = alias.alias;
    //                     }
    //                 }
    //             }
    //             // console.log('Cargando el alias: ' + comercios[i].alias);
    //             comercios_.push({
    //                 vende: comercios[i].vende,
    //                 primerLogin: comercios[i].primerLogin,
    //                 aceptoTerminoProveedor: comercios[i].aceptoTerminoProveedor,
    //                 aceptoTerminosVendedor: comercios[i].aceptoTerminosVendedor,
    //                 horarioAtencion: comercios[i].horarioAtencion,
    //                 contactos: comercios[i].contactos,
    //                 _id: comercios[i]._id,
    //                 fechaAlta: comercios[i].fechaAlta,
    //                 entidad: comercios[i].entidad,
    //                 alias: alias_
    //             });
    //             // comercios_.push(comercios[i]);

    //             i++;
    //         }

    //         // console.log('Busqueda de alias finalizada, el array de comercios vale');
    //         // i = 0;
    //         // hasta = comercios_.length;
    //         // while (i < hasta) {
    //         //     console.log(comercios_[i].alias);
    //         //     i++;
    //         // }

    //         // console.log(comercios_);

    //         res.json({
    //             ok: true,
    //             message: 'Comercios encontrados',
    //             comercios: comercios_
    //         });

    //         // res.json({
    //         //     ok: true,
    //         //     message: 'Comercios encontrados',
    //         //     comercios
    //         // });

    // });



});

app.post('/proveedor/existe/', async function(req, res) {
    let hoy = new Date();
    console.log(hoy + ' Analizando si el proveedor esta en la base de datos');
    Proveedor.find({ '_id': req.body.proveedor })
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
                    message: 'La busqueda no encontro ningun proveedor con el id ' + req.body.comercio
                });
            }

            if (comerciosDB.length == 0) {
                return res.json({
                    ok: false,
                    message: 'La busqueda no encontro ningun proveedor con el id ' + req.body.comercio
                });
            }

            return res.json({
                ok: true,
                message: 'El proveedor esta cargado'
            });

        });
});


app.post('/proveedor/cargar_imagenes/', async function(req, res) {
    let hoy = new Date();
    for (var i in req.body.imagenes) {
        hoy = new Date();
        let imagenProveedor = new ImagenProveedor({
            formato: req.body.imagenes[i].extension
        });

        if (req.body.imagenes[i].extension == 'png' || req.body.imagenes[i].extension == 'jpg' || req.body.imagenes[i].extension == 'jpeg') {
            console.log(hoy + ' Paso la validacion de formato de imagen');
            var target_path = process.env.UrlImagenProveedor + imagenProveedor._id + '.' + req.body.imagenes[i].extension; // hacia donde subiremos nuestro archivo dentro de nuestro servidor
            console.log(hoy + ' Path Destino: ' + target_path);
            await fs.writeFile(target_path, new Buffer(req.body.imagenes[i].imagen, "base64"), async function(err) {
                //Escribimos el archivo

                if (err) {
                    console.log(hoy + ' La subida del archivo produjo un error: ' + err.message);
                    return {
                        ok: false,
                        message: 'La subida del archivo produjo un error'
                    };
                }
                console.log(hoy + ' La imagen se termino de mover');
                imagenProveedor.url = 'http://www.bintelligence.net/imagenes_proveedor/' + imagenProveedor._id + '.' + req.body.imagenes[i].extension;
                imagenProveedor.nombre = imagenProveedor._id;

                console.log(hoy + ' Se esta por guardar el registro de la imagen');
                try {
                    imagenProveedor.save((error, imagen_) => {
                        if (error) {
                            console.log(hoy + ' El alta de la imagen produjo un error: ' + error.message);

                            return res.json({
                                ok: false,
                                message: 'El alta de la publicidad produjo un error: ' + error.message
                            });
                        }
                        console.log(hoy + 'Imagen guardada');
                    });
                } catch (e) {
                    console.log('Salida por el catch: ' + e.message);
                }
            });
        }
    }
    console.log(hoy + ' Termino el proceso');
    res.json({
        ok: true,
        message: 'Las imagenes se cargaron correctamente'
    });
});


app.post('/proveedor/subir_video/', async function(req, res) {
    let hoy = new Date();
    for (var i in req.body.videos) {
        let video = new VideoProveedor({
            titulo: req.body.videos[i].titulo,
            canal: req.body.videos[i].canal,
            url: req.body.videos[i].url
        });

        video.save(async(err, ok) => {
            if (err) {
                console.log(hoy + ' El alta de video arrojo un error');
                console.log(hoy + ' ' + err.message);
                return res.json({
                    ok: false,
                    message: 'El alta de video produjo un error'
                });
            }

            //agrego el video a la lista del proveedor
            Proveedor.findOneAndUpdate({ _id: req.body.idProveedor }, {
                $push: {
                    videos: video._id
                }
            }, async function(errA, okA) {
                if (errA) {
                    console.log(hoy + ' La actualizacion del proveedor para agregar una imagen produjo un error');
                    console.log(hoy + ' Video que fallo: ' + ok.url);
                    console.log(hoy + ' ' + errA.message);
                    return res.json({
                        ok: false,
                        message: 'El proceso de subir un video del proveedor fallo. Video errone: ' + ok.url
                    });
                }
            });
        });
    }

    res.json({
        ok: true,
        message: 'Proceso finalizado con exito'
    });
});

//////////////// MANEJO DE CONFIGURACION DE PROVEEDORES ////////////////

app.post('/proveedor/agregar_cobertura/', async function(req, res) {
    console.log('Llega la peticion');
    let hoy = new Date();
    if (req.body.coberturas) {
        console.log('Hay coberturas');
        try {
            // let cobertura = new Cobertura();
            for (var i in req.body.coberturas) {
                //genero el objeto
                let cobertura = new Cobertura({
                    nombreZona: req.body.coberturas[i].nombreZona
                });
                if (req.body.coberturas[i].provincias) {
                    console.log('Hay provincias para analizar');
                    let provincias = [];
                    for (var j in req.body.coberturas[i].provincias) {

                        let provincia = {
                            provincia: req.body.coberturas[i].provincias[j].provincia,
                            localidades: []
                        };
                        if (req.body.coberturas[i].provincias[j].localidades) {
                            for (var k in req.body.coberturas[i].provincias[j].localidades) {
                                let localidad = {
                                    localidad: req.body.coberturas[i].provincias[j].localidades[k].localidad,
                                    barrios: []
                                };
                                if (req.body.coberturas[i].provincias[j].localidades[k].barrios) {
                                    for (var l in req.body.coberturas[i].provincias[j].localidades[k].barrios) {
                                        let barrio = {
                                            barrio: req.body.coberturas[i].provincias[j].localidades[k].barrios[l].barrio,
                                            entregaADomicilio: req.body.coberturas[i].provincias[j].localidades[k].barrios[l].entregaADomicilio,
                                            costoEntrega: req.body.coberturas[i].provincias[j].localidades[k].barrios[l].costoEntrega
                                        };
                                        localidad.barrios.push(barrio);
                                    }
                                    provincia.localidades.push(localidad);
                                } else {
                                    //no hay barrios, no se puede continuar con el proceso
                                    return res.json({
                                        ok: false,
                                        message: 'El area de cobertura esta incompleta. Faltan los barrios'
                                    });
                                }
                            }
                            provincias.push(provincia);
                        } else {
                            //no hay localidades, no se puede continuar con el proceso
                            return res.json({
                                ok: false,
                                message: 'El area de cobertura esta incompleta. Faltan las localidades'
                            });
                        }
                    }
                    cobertura.provincias = provincias;
                    //termino la carga del objeto, resta darle de alta
                    cobertura.save();
                    Proveedor.findOneAndUpdate({ _id: req.body.idProveedor }, {
                            $push: {
                                cobertura: cobertura._id
                            }
                        },
                        function(err, success) {
                            if (err) {
                                console.log('Fallo la ejecucion del proceso de asignacion de cobertura al proveedor');
                                console.log(err.message);
                            } else {
                                console.log('La cobertura se agrego correctamente');
                            }
                        });
                } else {
                    //no hay provincias, no se puede continuar con el proceso
                    console.log('No hay provincias para analizar');
                    return res.json({
                        ok: false,
                        message: 'El area de cobertura esta incompleta. Faltan la o las provincias'
                    });
                }
            }

            //aqui debo cargar la cobertura en el proveedor


            res.json({
                ok: true,
                message: 'Proceso de definicion de cobertura terminado'
            });
        } catch (e) {
            console.log('Fallo un metodo en el try');
            console.log(e.message);
            console.log(e.stack);
            return res.json({
                ok: false,
                message: 'Fallo en la ejecucion del proceso.Salida controlada'
            });
        }
    } else {
        //no hay coberturas, no se puede continuar con el proceso
        console.log('No hay datos de cobertura para procesar');
        return res.json({
            ok: false,
            message: 'No hay datos para armar la cobertura'
        });
    }
});

module.exports = app;