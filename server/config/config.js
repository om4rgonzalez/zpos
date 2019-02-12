//  PUERTO
process.env.PORT = process.env.PORT || 3000;

//URL DEL SERVICIO
process.env.URL_SERVICE = process.env.URL_SERVICE || 'http://localhost:'

//Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev;'


//base de datos
let urlDB;
if (process.env.NODE_ENV == 'prod') {
    //urlDB = 'mongodb://bitbi:Bintelligence123!@127.0.0.1:27017/zpos';
    urlDB = 'mongodb://localhost:27017/zpos';
} else {
    urlDB = 'mongodb://sa:Bintech123@ds139331.mlab.com:39331/zpos'
}

let urlImagen;

if (process.env.NODE_ENV == 'prod') {
    urlImagen = '/var/www/imagenes_publicidad/';
} else {
    urlImagen = '/home/marcelo/img/'
}

let urlImagenProducto;
let urlImagenProveedor;

if (process.env.NODE_ENV == 'prod') {
    urlImagenProducto = '/var/www/imagenes_productos/';
    urlImagenProveedor = '/var/www/imagenes_proveedor/';
} else {
    urlImagenProducto = '/home/marcelo/imagenes_productos/';
    urlImagenProveedor = '/home/marcelo/imagenes_proveedor/';
}

process.env.UrlImagen = urlImagen;

process.env.UrlImagenProducto = urlImagenProducto;

process.env.UrlImagenProveedor = urlImagenProveedor;






process.env.URLDB = urlDB;

// ============================
//  Vencimiento del Token
// ============================
// 60 segundos
// 60 minutos
// 24 horas
// 30 días
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

// ============================
//  SEED de autenticación
// ============================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';