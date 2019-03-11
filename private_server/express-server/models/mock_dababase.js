var Entrevista = require('./entrevista');
var Item = require('./item');
var Valor = require('./valor');

/*  ENTREVISTAS */

var entrevista_1 = new Entrevista(1, 'Entrevista 1', 'Descripción de la entrevista 1',
    'Responda a las cuestiones que se le vayan mostrando a lo largo de la entrevista (1)',
    'Asimismo, tenga en cuenta que hay preguntas tanto de opción única, como de múltiple selección (1)',
    'estado', 'f_creacion', 'f_limite');
var entrevista_2 = new Entrevista(2, 'Entrevista 2', 'Descripción de la entrevista 2',
    'Responda a las cuestiones que se le vayan mostrando a lo largo de la entrevista (2)',
    'Asimismo, tenga en cuenta que hay preguntas tanto de opción única, como de múltiple selección (2)');
entrevistas = [entrevista_1, entrevista_2];
e1_cont = 0;
e2_cont = 0;

/* ITEMS */

var item_1 = new Item(1, '1 -> ¿Cómo se ha encontrado a lo largo del día de hoy?', 'radio',
['Muy bien', 'Bien', 'Mal', 'Otro'], '2019');
var item_2 = new Item(2, '2 -> ¿Cómo se ha encontrado a lo largo del día de hoy?', 'radio',
['Muy bien', 'Bien', 'Mal', 'Otro'], '2019');
var item_3 = new Item(3, '3 -> ¿Cómo se ha encontrado a lo largo del día de hoy?', 'checkbox',
['Muy bien', 'Bien', 'Mal', 'Otro'], '2019');
var item_4 = new Item(4, '4 -> ¿Cómo se ha encontrado a lo largo del día de hoy?', 'checkbox',
['Muy bien', 'Bien', 'Mal', 'Otro'], '2019');
items = [item_1, item_2, item_3, item_4];

/* VALORES */

valores_e1 = [];
valores_e2 = [];

/**
 * Devuelve las entrevistas disponibles
 */
exports.getEntrevistas = function () {
    return Promise.resolve(entrevistas);
}

/**
 * Devuelve la entrevista asociada al ID: id
 */
exports.getEntrevista = function (id) {
    for (var i = 0; i < entrevistas.length; i++) {
        if (entrevistas[i].id == id) {
            return Promise.resolve(entrevistas[i]);
        }
    }
    return Promise.resolve(null);
}

/**
 * Devuvelve la siguiente pregunta asociada a la entrevista con ID: id
 */
exports.getItem = function(id) {
    var item = null;
    if(id == 1) {
        item = items[e1_cont];
        if(e1_cont == items.length) {
            borrarEntrevista(id);
        }
    } else if (id == 2) {
        item = items[e2_cont];
        if(e2_cont == items.length) {
            borrarEntrevista(id);
        }
    }
    return Promise.resolve([item]);
}

/**
 * Borra las entrevistas realizadas 
 */
function borrarEntrevista(id) {
    // TODO: Competencia de la BBDD
    for (var i = 0; i < entrevistas.length; i++) {
      if (entrevistas[i].id == id) {
          entrevistas.splice(i, 1);
      }
    }
}

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
