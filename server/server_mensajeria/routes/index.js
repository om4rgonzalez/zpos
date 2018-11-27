const express = require('express');
const app = express();

app.use(require('./plantilla'));
app.use(require('./bandeja_salida'));
// app.use(require('./entidad'));
// app.use(require('./proveedor'));
// app.use(require('./puntoVenta'));
// app.use(require('./comercio'));



module.exports = app;