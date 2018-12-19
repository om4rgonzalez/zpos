const express = require('express');
const axios = require('axios');
const app = express();
const Plantilla = require('../models/plantilla');
const BandejaSalida = require('../models/bandeja_salida');
const funciones = require('../../middlewares/funciones');
const Comercio = require('../../server_entidades/models/comercio');
const Proveedor = require('../../server_entidades/models/proveedor');
const Login = require('../../server_usuario/models/login');
const Destino = require('../models/destino');


app.post('/bandeja_salida/buscar_parametros/', function(req, res) {
    switch (req.body.parametro) {
        case "$comercio":
            Comercio.find({ _id: req.body.valor })
                .populate('entidad')
                .exec(async(err, comercio) => {
                    if (err) {
                        console.log('La busqueda del parametro $comercio devolvio un error: ' + err.mensaje);
                        return res.json({
                            ok: false,
                            respuesta: null
                        });
                    }

                    if (comercio.length == 0) {
                        console.log('La busqueda del parametro $comercio no devolvio resultados');
                        return res.json({
                            ok: false,
                            respuesta: null
                        });
                    }

                    return res.json({
                        ok: true,
                        respuesta: comercio[0].entidad.razonSocial
                    });
                });
            break;
        case "$proveedor":
            Proveedor.find({ _id: req.body.valor })
                .populate('entidad')
                .exec(async(err, proveedor) => {
                    if (err) {
                        console.log('La busqueda del parametro $proveedor devolvio un error: ' + err.mensaje);
                        return res.json({
                            ok: false,
                            respuesta: null
                        });
                    }

                    if (proveedor.length == 0) {
                        console.log('La busqueda del parametro $proveedor no devolvio resultados');
                        return res.json({
                            ok: false,
                            respuesta: null
                        });
                    }

                    return res.json({
                        ok: true,
                        respuesta: proveedor[0].entidad.razonSocial
                    });
                });
            break;
    }
});

app.post('/bandeja_salida/buscar_destino/', async function(req, res) {

    let destinos = [];
    let mensajeEnviar = '';
    console.log('Comienza la busqueda de destinos');
    console.log('Es push? ' + req.body.esPush);
    console.log('Es proveedor? ' + req.body.esProveedor);

    if (req.body.esPush) {

        if (req.body.esProveedor) {
            Proveedor.find({ _id: req.body.id })
                .populate('usuarios')
                .populate({ path: 'usuarios', populate: { path: 'rol' } })
                .exec(async(err, proveedor) => {
                    if (err) {
                        console.log('Error al buscar el proveedor para devolver el destino. ' + err.mensaje);
                        return res.json({
                            ok: false,
                            destino: null
                        });
                    }

                    if (proveedor.length == 0) {
                        console.log('La busqueda de proveedor para devolver destino no produjo resultados');
                        return res.json({
                            ok: false,
                            destino: null
                        });
                    }

                    let i = 0;
                    let hasta = proveedor[0].usuarios.length;
                    while (i < hasta) {
                        console.log('');
                        console.log('Usuario a analizar');
                        console.log(proveedor[0].usuarios[i]);
                        if (proveedor[0].usuarios[i].rol.precedencia == 1) {
                            let login = await funciones.buscarLoginUsuario({
                                _id: proveedor[0].usuarios[i]._id
                            });
                            if (login.error == 0) {
                                if (login.login.online) {
                                    destinos.push(login.login.idPush);
                                }
                            }
                        }
                        i++;
                    }

                    if (destinos.length == 0) {
                        console.log('No se encontraron destinos disponibles');
                        return res.json({
                            ok: false,
                            destino: null
                        });
                    }

                    res.json({
                        ok: true,
                        destino: destinos
                    });
                });
        } else {
            //es comercio
            Comercio.find({ _id: req.body.id })
                .populate('usuarios')
                .populate({ path: 'usuarios', populate: { path: 'rol' } })
                .exec(async(err, comercio) => {
                    if (err) {
                        console.log('Error al buscar el proveedor para devolver el destino. ' + err.mensaje);
                        return res.json({
                            ok: false,
                            destino: null
                        });
                    }

                    if (comercio.length == 0) {
                        console.log('La busqueda de proveedor para devolver destino no produjo resultados');
                        return res.json({
                            ok: false,
                            destino: null
                        });
                    }

                    let i = 0;
                    let hasta = comercio[0].usuarios.length;
                    console.log('Comercio encontrado');
                    console.log('Usuarios del comercio');
                    console.log(comercio[0].usuarios);
                    while (i < hasta) {
                        // if (comercio[0].usuarios[i].rol.precedencia == 1) {
                        if (1 == 1) {
                            let login = await funciones.buscarLoginUsuario({
                                _id: comercio[0].usuarios[i]._id
                            });
                            if (login.error == 0) {
                                if (login.login.online) {
                                    destinos.push(login.login.idPush);
                                }
                            }
                        }
                        i++;
                    }

                    if (destinos.length == 0) {
                        console.log('No se encontraron destinos disponibles');
                        return res.json({
                            ok: false,
                            destino: null
                        });
                    }

                    res.json({
                        ok: true,
                        destino: destinos
                    });
                });
        }
    }
});

app.post('/bandeja_salida/nuevo_mensaje/', async function(req, res) {

    //busco los parametros
    let parametros = req.body.parametros.split(";");
    let valores = req.body.valores.split(";");
    let buscar = req.body.buscar.split(";");
    for (var i in parametros) {
        // console.log('Parametro: ' + parametros[i]);
        // console.log('Busca el Parametro? : ' + buscar[i]);
        // console.log('Valor: ' + valores[i]);
        if (buscar[i] == "SI") {
            console.log('Buscando el parametro');
            let resp = await funciones.buscarParametros({
                parametro: parametros[i],
                valor: valores[i]
            });
            // console.log('Respuesta de la busqueda');
            // console.log(resp);
            if (resp.ok) {
                valores[i] = resp.respuesta;
                // console.log('Nuevo Valor: ' + valores[i]);
            }
        }
    }

    //busco la plantilla
    console.log('Buscando la plantilla');
    let plantilla = await funciones.buscarPlantilla(req.body.metodo, req.body.tipoError);
    console.log('Respuesta de la busqueda de plantilla');
    console.log(plantilla);
    if (plantilla.error == 0) {
        //no hubo error, procedo con el armado del mensaje

        console.log('');
        console.log('reemplazando valores en la cadena');
        for (var i in parametros) {
            console.log('Parametro: ' + parametros[i]);
            console.log('Valores: ' + valores[i]);
            plantilla.plantilla.mensaje = plantilla.plantilla.mensaje.replace(parametros[i], valores[i]);
            console.log('El nuevo mensaje queda asi');
            console.log(plantilla.plantilla.mensaje);
        }

        //ahora busco el o los destinos
        let destinos = await funciones.buscarDestinos({
            esPush: req.body.esPush, //boolean
            esProveedor: req.body.destinoEsProveedor, //boolean
            id: req.body.destino
        });

        // console.log('');
        // console.log('La busqueda de destinos devolvio:');
        // console.log(destinos);

        let destinos_ = [];
        if (!destinos.ok) {
            console.log('No hay destinos a los cuales enviar push');
        } else {
            let i = 0;
            let hasta = destinos.destino.length;
            // console.log('Destinos encontrados');
            // console.log('====================');
            while (i < hasta) {
                let destino = new Destino({
                    contacto: destinos.destino[i]
                });
                destinos_.push(destinos.destino[i]);
                destino.save((err_des, ok) => {
                    if (err_des) {
                        console.log('Error al guardar el destino. ' + err_des.message);
                    } else
                        console.log('Destino Guardado');
                });
                // if(!req.body.esPush){
                //     destino.tipoContacto = 
                // }
                // console.log(destinos.destino[i]);
                i++;
            }
        }

        //guardo el mensaje
        let bandejaSalida = new BandejaSalida({
            mensaje: plantilla.plantilla.mensaje,
            titulo: plantilla.plantilla.titulo,
            destino: req.body.destino
        });
        let mensajeEnviado = false;

        if (destinos_.length > 0) {
            bandejaSalida.destinos = destinos_;
            let players = '';
            for (var j in destinos_) {
                if (j == 0) {
                    players = destinos_[j];
                } else {
                    players = players + ',' + destinos_[j];
                }
            }
            // console.log('Destino al que se le manda el push: ' + players);
            let respEnviaPush = await funciones.enviarPush(players, bandejaSalida.titulo, bandejaSalida.mensaje);
            mensajeEnviado = respEnviaPush.ok;
        }
        bandejaSalida.enviado = mensajeEnviado;

        bandejaSalida.save(async(err, bandeja) => {
            if (err) {
                console.log('Se produjo un error al guardar la bandeja de salida. ' + err.message);
                return res.json({
                    error: 1,
                    message: 'Se produjo un error al guardar la bandeja de salida'
                });
            }

            res.json({
                error: 0,
                message: 'Se guardo el mensaje'
            });
        });
    }

});


app.post('/bandeja_salida/enviar/', async function(req, res) {

    let URL = 'https://onesignal.com/api/v1/notifications';
    // let config = {
    //     headers: {
    //         'Authorization': 'Basic OTM5YzJmNmEtZmY0Mi00NjE3LThjN2ItNDIwYjIwZTIxNzli',
    //         'Content-Type': 'application/json'
    //     }
    // }

    //   let resp = await axios.post(URL, {
    //     parametro: objeto.parametro,
    //     valor: objeto.valor
    // });

    // console.log('Preparando entorno para enviar push');
    // console.log('Players: ' + req.body.players);
    // console.log('Titulo: ' + req.body.titulo);
    // console.log('Mensaje: ' + req.body.mensaje);
    let include_player_ids = req.body.players.split(',');

    let data = {
        app_id: 'dbfe0f75-b1ff-44b0-9660-0ba5b72702c1',
        include_player_ids: include_player_ids,
        headings: {
            en: req.body.titulo,
            es: req.body.titulo
        },
        contents: {
            en: req.body.mensaje,
            es: req.body.mensaje
        }
    };

    // console.log(data);

    let resp = await axios({
        method: 'post', //you can set what request you want to be
        url: URL,
        data: data,
        headers: {
            'Authorization': 'Basic OTM5YzJmNmEtZmY0Mi00NjE3LThjN2ItNDIwYjIwZTIxNzli',
            'Content-Type': 'application/json'
        }
    });

    // console.log('Respuesta servicio push');
    // console.log(resp);
    console.log('Push Enviado');
    res.json({
        ok: true,
        message: 'Terminado el proceso de envio'
    });
});


app.post('/bandeja_salida/test_envio_push/', async function(req, res) {

    let URL = 'https://onesignal.com/api/v1/notifications';


    let resp = await axios({
        method: 'post', //you can set what request you want to be
        url: URL,
        data: {
            "app_id": "dbfe0f75-b1ff-44b0-9660-0ba5b72702c1",
            "include_player_ids": ["6f476f6a-8d55-4297-b03c-878d0bb23a6e"],
            "headings": { "en": "English Title", "es": "Test" },
            "contents": { "en": "English Message", "es": "Probando la mensajeria push desde el servidor" }
        },
        headers: {
            'Authorization': 'Basic OTM5YzJmNmEtZmY0Mi00NjE3LThjN2ItNDIwYjIwZTIxNzli',
            'Content-Type': 'application/json'
        }
    });

    console.log('Respuesta servicio push');
    console.log(resp);

    res.json({
        ok: true,
        message: 'Terminado el proceso de envio'
    });
});




module.exports = app;