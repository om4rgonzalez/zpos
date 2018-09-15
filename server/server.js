require('./config/config');

const mongoose = require('mongoose');
const express = require('express');

const app = express();
const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json());
console.log('Llego la peticion');

//indice de rutas
// app.use(require('./routes/index'));
app.use(require('./server_direccion/server_direccion'));
app.use(require('./server_entidades/server_entidades'));
app.use(require('./server_persona/server_persona'));
app.use(require('./server_usuario/server_usuario'));
app.use(require('./server_contacto/server_contacto'));
app.use(require('./server_configuracion/server-configuracion'));
app.use(require('./server_pedido/server_pedido'));


mongoose.connect(process.env.URLDB, (err, res) => {
    if (err) throw err;
    console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, () => {
    console.log('Usuario Escuchando el puerto ', process.env.PORT);
});