const express = require('express');
const app = express();

app.use(require('./reportes_pedidos'));
app.use(require('./reportes_productos'));
app.use(require('./reportes_clientes'));



module.exports = app;