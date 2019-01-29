const express = require('express');
const app = express();

app.use(require('./reportes_pedidos'));
// app.use(require('./rol'));



module.exports = app;