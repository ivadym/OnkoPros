var Valor = require('./valor');

/* VALORES */

valores_e1 = [];
valores_e2 = [];

/**
 * Guarda la respuesta del usuario
 */
exports.setValor = function(id_entrevista, id_valor, valor, valorTexto) {
    var valor = new Valor(id_valor, valor, valorTexto);
    if(id_entrevista == 1) {
        valores_e1.push(valor);
        e1_cont++;
    } else if (id_entrevista == 2) {
        valores_e2.push(valor)
        e2_cont++;
    }
    return Promise.resolve(valor);
}
