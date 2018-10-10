const express = require('express');
const app = express();

app.use(require('./publicidad'));
// app.use(require('./rol'));



module.exports = app;