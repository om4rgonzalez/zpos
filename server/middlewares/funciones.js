const axios = require('axios');
const EstadosPedido = require('../server_pedido/src/estados_pedido.json');
const fs = require('fs');



let nuevaEntidad = async(entidad, domicilio) => {

    // console.log('Entidad recibida');
    // console.log(entidad);

    let URL = process.env.URL_SERVICE + process.env.PORT + '/entidad/nueva_/';
    // console.log('URL a conectarse: ' + URL);
    let resp = await axios.post(URL, {

        pais: domicilio.pais,
        provincia: domicilio.provincia,
        localidad: domicilio.localidad,
        barrio: domicilio.barrio,
        calle: domicilio.calle,
        numeroCasa: domicilio.numeroCasa,
        piso: domicilio.piso,
        numeroDepartamento: domicilio.numeroDepartamento,
        latitud: domicilio.latitud,
        longitud: domicilio.longitud,
        codigoPostal: domicilio.codigoPostal,
        idEntidad: entidad._id,
        cuit: entidad.cuit,
        razonSocial: entidad.razonSocial,
        actividadPrincipal: entidad.actividadPrincipal,
        tipoPersoneria: entidad.tipoPersoneria

    });


    return {
        ok: true,
        domicilio: resp.data.entidadDB.domicilio
    }

};

let nuevoPuntoVenta = async(punto) => {

    let URL = process.env.URL_SERVICE + process.env.PORT + '/proveedor/nuevo_punto_venta/';
    // console.log('URL a conectarse: ' + URL);
    let resp = await axios.post(URL, {
        _id: punto._id,
        nombrePuntoVenta: punto.nombrePuntoVenta,
        domicilio: punto.domicilio
    });


    return {
        ok: true
    }

};



const nuevoDetalle = async(detalle) => {

    let URL = process.env.URL_SERVICE + process.env.PORT + '/pedido/nuevo_detalle';
    // console.log('URL a conectarse: ' + URL);
    let resp = await axios.post(URL, {
        _id: detalle._id,
        producto: detalle.producto,
        unidadMedida: detalle.unidadMedida,
        cantidad: detalle.cantidad
    });

    return {
        ok: true
    }

}

let nuevoDomicilio = async(domicilio) => {

    let URL = process.env.URL_SERVICE + process.env.PORT + '/domicilio/nuevo';
    // console.log('URL a conectarse: ' + URL);
    let resp = await axios.post(URL, {
        _id: domicilio._id,
        pais: domicilio.pais,
        provincia: domicilio.provincia,
        localidad: domicilio.localidad,
        barrio: domicilio.barrio,
        calle: domicilio.calle,
        numeroCasa: domicilio.numeroCasa,
        piso: domicilio.piso,
        numeroDepartamento: domicilio.numeroDepartamento,
        latitud: domicilio.latitud,
        longitud: domicilio.longitud,
        codigoPostal: domicilio.codigoPostal
    });

    return {
        ok: true
    }

};


let nuevaPersona = async(persona) => {

    let URL = process.env.URL_SERVICE + process.env.PORT + '/persona/nueva/';
    let resp = await axios.post(URL, {
        _id: persona._id,
        tipoDni: persona.tipoDni,
        dni: persona.dni,
        apellidos: persona.apellidos,
        nombres: persona.nombres,
        domicilio: persona.domicilio,
        fechaNacimiento: persona.fechaNacimiento
    });
    // console.log('termino la ejecucion del axios');
    // console.log('Respuesta del servicio: ' + resp.contactoDB._id);

    return {
        ok: true
    }

};

const nuevoContacto = async(contacto) => {

    let URL = process.env.URL_SERVICE + process.env.PORT + '/contacto/nuevo/';
    // console.log('URL a conectarse: ' + URL);
    let resp = await axios.post(URL, {
        _id: contacto._id,
        tipoContacto: contacto.tipoContacto,
        codigoPais: contacto.codigoPais,
        codigoArea: contacto.codigoArea,
        numeroCelular: contacto.numeroCelular,
        numeroFijo: contacto.numeroFijo,
        email: contacto.email
    });
    // console.log('termino la ejecucion del axios');
    // console.log('Respuesta del servicio: ' + resp.contactoDB._id);

    return {
        ok: true
    }

};

const nuevoUsuario = async(usuario) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/usuario/nuevo_usuario_arranque/';
    // console.log(usuario);
    let resp = await axios.post(URL, {
        _id: usuario._id,
        idPersona: 0,
        tipoDni: usuario.persona.tipoDni,
        dni: usuario.persona.dni,
        apellidos: usuario.persona.apellidos,
        nombres: usuario.nombres,
        // 'persona.fechaNacimiento': usuario.persona.fechaNacimiento,
        // 'domicilio.pais': usuario.persona.domicilio.pais,
        // 'domicilio.provincia': usuario.persona.domicilio.provincia,
        // 'domicilio.localidad': usuario.persona.domicilio.localidad,
        // 'domicilio.barrio': usuario.persona.domicilio.barrio,
        // 'domicilio.calle': usuario.persona.domicilio.calle,
        // 'domicilio.numeroCasa': usuario.persona.domicilio.numeroCasa,
        // "contactos":[{"tipoContacto": "Telefono Celular",
        //     "codigoPais": "+549",
        //     "codigoArea": "388",
        //     "numeroCelular": "6011979"},
        //     {"tipoContacto": "Email",
        //     "email": "ismael_14@gmail.com"}
        //     ],
        nombreUsuario: usuario.nombreUsuario,
        clave: usuario.clave,
        rol: usuario.rol
    });
    // console.log('termino la ejecucion del axios');
    // console.log('Respuesta del servicio: ' + resp.contactoDB._id);

    return {
        ok: true
    }
};


const combosNuevoProveedor = async() => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/domicilio/provincias';
    // console.log('URL: ' + URL);
    let provincias_ = await axios.get(URL);
    URL = process.env.URL_SERVICE + process.env.PORT + '/conf/actividades_principales_proveedor/';
    let actividadesProveedor = await axios.get(URL);
    URL = process.env.URL_SERVICE + process.env.PORT + '/conf/actividades_principales_comercio/';
    let actividadesComercio = await axios.get(URL);
    URL = process.env.URL_SERVICE + process.env.PORT + '/conf/tipos_personeria/';
    let tiposPersoneria = await axios.get(URL);
    // URL = process.env.URL_SERVICE + process.env.PORT + '/domicilio/estadosCasa';
    // let estadosCasa = await axios.get(URL);
    URL = process.env.URL_SERVICE + process.env.PORT + '/contacto/tipos';
    let tiposContacto_ = await axios.get(URL);
    // URL = process.env.URL_SERVICE + process.env.PORT + '/persona/tipos_dni';
    // let tiposDni = await axios.get(URL);
    // URL = process.env.URL_SERVICE + process.env.PORT + '/cliente/obtener_tipos';
    // let tiposCliente = await axios.get(URL);
    // URL = process.env.URL_SERVICE + process.env.PORT + '/credito/obtener_tipos_planes';
    // let tiposPlanes = await axios.get(URL);


    let respuesta = new Object({
        provincias: provincias_.data,
        actividadesPrincipalesComercio: actividadesComercio.data,
        actividadesPrincipalesProveedor: actividadesProveedor.data,
        tiposPersoneria: tiposPersoneria.data,
        estadosPedido: EstadosPedido,
        // estadosCasa: estadosCasa.data.estadosCasaDB,
        tiposContacto: tiposContacto_.data.TiposContacto
            // tiposDni: tiposDni.data.tiposDni,
            // tiposCliente: tiposCliente.data.tipoCliente,
            // tiposPlanes: tiposPlanes.data.tipoPlan,
            // documentos: documentos_,
            // itemAnalisis: ItemAnalisis
    });
    return respuesta;
};


let login = async(usuario) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/usuario/ingresar/';
    // console.log(usuario);
    let resp = await axios.post(URL, {

        nombreUsuario: usuario.nombreUsuario,
        clave: usuario.clave,
        idPush: usuario.idPush
    });
    if (resp.data.ok) {
        return {
            ok: true,
            _id: resp.data.usuario._id,
            token: resp.data.token
        };
    } else {
        return {
            ok: false,
            message: 'Usuario o clave incorrecta'
        };
    }
};

let buscarLoginUsuario = async(usuario) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/usuario/buscar_login/';
    let resp = await axios.post(URL, {
        idUsuario: usuario
    });
    // console.log('Data que devuelve la respuesta: ');
    // console.log(resp.data);
    return resp.data;
};


//la funcion busca si el proveedor esta cargado en la red del comercio
let verificarExistenciaProveedorEnRedComercio = async(proveedor, comercio) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/comercio/buscar_proveedor/';
    let resp = await axios.post(URL, {
        proveedor: proveedor,
        comercio: comercio
    });

    // console.log('la funcion devolvio ' + resp.data.ok);
    // console.log(resp.data.message);

    if (resp.data.ok) {
        return {
            ok: false,
            message: 'El proveedor ya es parte de la red'
        };
    }
    return {
        ok: true,
        message: 'El proveedor no es parte de la red'
    };

};

//la funcion busca si el proveedor esta cargado en la red del comercio
let verificarExistenciaProveedorEnRedProveedor = async(proveedor, comercio) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/proveedor/buscar_proveedor_en_red/';
    let resp = await axios.post(URL, {
        proveedor: proveedor,
        comercio: comercio
    });

    // console.log('la funcion devolvio ' + resp.data.ok);
    // console.log(resp.data.message);

    if (resp.data.ok) {
        return {
            ok: false,
            message: 'El proveedor ya es parte de la red'
        };
    }
    return {
        ok: true,
        message: 'El proveedor no es parte de la red'
    };

};


let cargarImagenPublicidad = async(imagen, nombre) => {
    var tmp_path = imagen.path; //ruta del archivo
    var tipo = imagen.type; //tipo del archivo

    if (tipo == 'image/png' || tipo == 'image/jpg' || tipo == 'image/jpeg') {
        var target_path = process.env.UrlImagen + nombre + '.' + imagen.name.split(".").pop(); // hacia donde subiremos nuestro archivo dentro de nuestro servidor
        // console.log('Path Destino: ' + target_path);
        await fs.rename(tmp_path, target_path, async function(err) {
            //Escribimos el archivo

            if (err) {
                console.log('La subida del archivo produjo un error: ' + err.message);
                return {
                    ok: false
                };
            }

            return {
                ok: true
            };
        });
    } else {
        return {
            ok: false
        };
    }
};

let buscarPlantilla = async(metodo, tipoError) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/plantilla/buscar_plantilla/';

    // console.log('URL buscar plantilla: ' + URL);
    // console.log('Parametros: ');
    // console.log('Metodo: ' + metodo);
    // console.log('tipoError: ' + tipoError);
    let resp = await axios.post(URL, {
        metodo: metodo,
        tipoError: tipoError
    });

    // console.log('la funcion devolvio ' + resp.data.ok);
    // console.log(resp.data.message);
    return {
        error: resp.data.error,
        message: resp.data.message,
        plantilla: resp.data.plantilla
    };

};

let nuevoMensaje = async(mensaje) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/bandeja_salida/nuevo_mensaje/';
    // console.log('URL de acceso a nuevo mensaje: ' + URL);
    let resp = await axios.post(URL, {
        metodo: mensaje.metodo,
        tipoError: mensaje.tipoError,
        parametros: mensaje.parametros,
        valores: mensaje.valores,
        buscar: mensaje.buscar,
        esPush: mensaje.esPush,
        destinoEsProveedor: mensaje.destinoEsProveedor,
        destino: mensaje.destino
    });

    // console.log('la funcion devolvio ' + resp.data.ok);
    // console.log(resp.data.message);
    return resp;
};

let buscarParametros = async(objeto) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/bandeja_salida/buscar_parametros/';
    let resp = await axios.post(URL, {
        parametro: objeto.parametro,
        valor: objeto.valor
    });
    // console.log('La funcion de busqueda de parametros devuelve');
    // console.log(resp.data);
    return resp.data;
};

let buscarDestinos = async(objeto) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/bandeja_salida/buscar_destino/';
    let resp = await axios.post(URL, {
        esPush: objeto.esPush, //boolean
        esProveedor: objeto.esProveedor, //boolean
        id: objeto.id
    });
    // console.log('La funcion de busqueda de parametros devuelve');
    // console.log(resp.data);
    return resp.data;
};

let enviarPush = async(players, titulo, mensaje) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/bandeja_salida/enviar/';
    let resp = await axios.post(URL, {
        players: players,
        titulo: titulo,
        mensaje: mensaje
    });
    // console.log('La funcion de busqueda de parametros devuelve');
    // console.log(resp.data);
    return resp.data;
};

let buscarProveedorPorId = async(id) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/proveedor/buscar_proveedor/';
    let resp = await axios.post(URL, {
        idProveedor: id
    });
    // console.log('La funcion de busqueda de parametros devuelve');
    // console.log(resp.data);
    return resp.data;
};

let buscarComercioPorId = async(id) => {
    let URL = process.env.URL_SERVICE + process.env.PORT + '/comercio/buscar_comercio/';
    let resp = await axios.post(URL, {
        idComercio: id
    });
    // console.log('La funcion de busqueda de parametros devuelve');
    // console.log(resp.data);
    return resp.data;
};

// let nuevaInvitacion = async(invitacion) => {
//     let URL = process.env.URL_SERVICE + process.env.PORT + '/invitacion/nueva/';
//     let resp = await axios.post(URL, {
//         comercio: invitacion.comercio,
//         proveedor: invitacion.proveedor,
//         texto: invitacion.texto,
//         esProveedor: invitacion.esProveedor
//     });
//     // console.log('La funcion de busqueda de parametros devuelve');
//     // console.log(resp.data);
//     return resp.data;
// };

module.exports = {
    nuevoDetalle,
    nuevoDomicilio,
    nuevaEntidad,
    nuevoPuntoVenta,
    nuevaPersona,
    nuevoContacto,
    nuevoUsuario,
    combosNuevoProveedor,
    login,
    verificarExistenciaProveedorEnRedComercio,
    cargarImagenPublicidad,
    buscarLoginUsuario,
    buscarPlantilla,
    nuevoMensaje,
    buscarParametros,
    buscarDestinos,
    enviarPush
    // ,nuevaInvitacion
    ,
    verificarExistenciaProveedorEnRedProveedor,
    buscarProveedorPorId,
    buscarComercioPorId
}