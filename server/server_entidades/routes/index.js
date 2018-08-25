const express = require('express');
const app = express();

app.use(require('./actividadPrincipal'));
app.use(require('./tipoPersoneria'));
app.use(require('./entidad'));
app.use(require('./proveedor'));
app.use(require('./puntoVenta'));
// app.use(require('./tipoReferencia'));



module.exports = app;