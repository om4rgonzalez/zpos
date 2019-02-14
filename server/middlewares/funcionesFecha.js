const axios = require('axios');
const EstadosPedido = require('../server_pedido/src/estados_pedido.json');
const fs = require('fs');


let obtenerDiaSemana = async() => {
    let date = new Date('02/17/2019');

    let options = {
        weekday: 'long'
            // ,
            // year: 'numeric',
            // month: 'long',
            // day: 'numeric'
    };
    console.log('Numero del dia: ' + date.getDay());
    console.log(date.toLocaleDateString('es-ES', options));
};

let calcularFechaEntrega = async(periodos, fecha) => {
    //obtengo el numero del dia de la semana de hoy
    let numeroDia = fecha.getDay();
    let diferencia = 0;
    //recorro el array de periodos de entrega
    let i = 0;
    let h = periodos.length;
    console.log('Fecha que recibe: ' + fecha);
    while (i < h) {
        //verifico si el numero del dia de la semana de hoy es menor que el del periodo
        if (numeroDia < periodos[i].diaFijo) {
            //cumple con esta condicion, entonces el dia fijo es el dia de entrega
            diferencia = periodos[i].diaFijo - numeroDia;
            fecha.setDate(fecha.getDate() + diferencia);
            console.log('Fecha de entrega: ' + fecha);
            return {
                ok: true,
                fechaEntrega: fecha
            }
        }
        i++;
    }
};

module.exports = {
    obtenerDiaSemana,
    calcularFechaEntrega
}