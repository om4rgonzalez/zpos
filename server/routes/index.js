const express = require('express');
const app = express();

app.use(require('./unidadMedida'));
app.use(require('./proveedor'));
app.use(require('./producto'));
app.use(require('./comercio'));
app.use(require('./estado'));
app.use(require('./pedido'));
app.use(require('./detallePedido'));



module.exports = app;