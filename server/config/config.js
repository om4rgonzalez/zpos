//  PUERTO
process.env.PORT = process.env.PORT || 3000;

//URL DEL SERVICIO
process.env.URL_SERVICE = process.env.URL_SERVICE || 'http://localhost:'

//Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev;'


//base de datos
let urlDB;
if (process.env.NODE_ENV == 'prod') {
    urlDB = 'mongodb://localhost:27017/zpos';
} else {
    urlDB = 'mongodb://sa:Bintech123@ds139331.mlab.com:39331/zpos'
}

let urlImagen;

if (process.env.NODE_ENV == 'prod') {
    urlImagen = 'C:\\xampp\\htdocs\\imagenes_publicidad\\';
} else {
    urlImagen = '/home/marcelo/img/'
}

let urlImagenProducto;

if (process.env.NODE_ENV == 'prod') {
    urlImagenProducto = 'C:\\xampp\\htdocs\\imagenes_productos\\';
} else {
    urlImagenProducto = '/home/marcelo/imagenes_productos/'
}

process.env.UrlImagen = urlImagen;

process.env.UrlImagenProducto = urlImagenProducto;



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