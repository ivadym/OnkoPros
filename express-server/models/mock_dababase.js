var Usuario = require ('./usuario');
var Entrevista = require('./entrevista');
var Item = require('./item');
var Valor = require('./valor');

var usuario_1 = new Usuario(1, 'test1', 'Paciente', 'Prueba', 'Prueba');
var usuario_2 = new Usuario(2, 'a', 'Admin', 'Prueba', 'Prueba');
usuarios = [usuario_1, usuario_2];

var clave_1 = 'pass1';
var clave_2 = 'a';
claves = [clave_1, clave_2];

var entrevista_1 = new Entrevista(1, 'Entrevista 1', 'estado', 'f_creacion', 'f_limite');
var entrevista_2 = new Entrevista(2, 'Entrevista 2');
entrevistas = [entrevista_1, entrevista_2];
e1_cont = 0;
e2_cont = 0;

var item_1 = new Item(1, 'Item 1', 'radio', ['A1', 'B', 'C', 'Otro'], '2019');
var item_2 = new Item(2, 'Item 2', 'radio', ['A2', 'B', 'C', 'Otro'], '2019');
var item_3 = new Item(3, 'Item 3', 'checkbox', ['A3', 'B', 'C', 'Otro'], '2019');
var item_4 = new Item(4, 'Item 4', 'checkbox', ['A4', 'B', 'C', 'Otro'], '2019');
items = [item_1, item_2, item_3, item_4];

valores_e1 = [];
valores_e2 = [];

/**
 * Comprueba las credenciales de usuario
 */
exports.checkCredenciales = function (usuario, clave) {
    for (var i = 0; i < usuarios.length; i++) {
        if (usuarios[i].usuario == usuario && claves[i] == clave) {
            return Promise.resolve(usuarios[i]);
        }
    }
    return Promise.resolve(null);
}

/**
 * Devuelve las entrevistas disponibles
 */
exports.getEntrevistas = function () {
    return Promise.resolve(entrevistas);
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
