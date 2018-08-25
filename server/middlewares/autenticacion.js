const jwt = require('jsonwebtoken');
const Usuario = require('../server_usuario/models/usuario');
const permisos = require('../src/permisos.json');


// =====================
// Verificar Token
// =====================
// let verificaToken = (req, res, next) => {

//     let token = req.get('token');

//     jwt.verify(token, process.env.SEED, (err, decoded) => {

//         if (err) {
//             return res.status(401).json({
//                 ok: false,
//                 err: {
//                     message: 'Token no válido'
//                 }
//             });
//         }

//         req.usuario = decoded.usuario;
//         next();

//     });



// };

const validarToken = async(token) => {
    // console.log('token a validar:    ' + token);
    let usuario = new Usuario({
        _id: '0',
        precedencia: 0
    });
    // console.log('decodificando el token');
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        // console.log('verificando errores');
        if (err) {
            usuario = null;
        } else {
            usuario._id = decoded.usuario._id;
            usuario.precedencia = decoded.usuario.rol.precedencia;
            usuario.clave = decoded.usuario.clave;
            return usuario;
        }
    });
    return usuario;
};

// =====================
// Verifica AdminRole
// =====================
let verifica_Permiso = async(usuario) => {

    // let usuario = req.usuario;

    for (var p of permisos) {
        // console.log("precedencia: " + usuario.rol.precedencia);
        // console.log("url del archivo: " + p.url.trim());
        // console.log("url del request:" + req.url);
        if (p.url.trim() === usuario.url.trim()) {
            // console.log("rol del usuario: " + usuario.rol.precedencia);
            // console.log(p.roles);
            // if (usuario.rol.precedencia in p.roles) {
            if (p.roles.includes(usuario.precedencia)) {
                return true;
            } else
                return false;
        }

    }

};


module.exports = {
    // verificaToken,
    validarToken,
    verifica_Permiso
}