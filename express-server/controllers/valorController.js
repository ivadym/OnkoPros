const db = require('../models/mock_dababase');

/**
 * Guarda la respuesta del usuario
 */
exports.setValor = function (req, res, next) {
    var id_entrevista = req.params['id'];
    var id_valor = req.body.id;
    var valor = req.body.valor;
    var valorTexto = req.body.valorTexto;
    almacenarValor(id_entrevista, id_valor, valor, valorTexto)
    .then(function(valor) {
        if(valor) {
            res.status(201).json(valor);
        } else {
            // TODO: Mejor manejo de errores
            res.sendStatus(500); // HTTP 500 Internal Server Error
        }
    })
    .catch(function(error) {
        // TODO: Mejor manejo de errores
        res.sendStatus(500); // HTTP 500 Internal Server Error
    });
};

/**
 * Almacena la respuesta del usuario en la base de datos
 */
function almacenarValor(id_entrevista, id_valor, valor, valorTexto) {
    // TODO: Acceso BBDD / Envío de la petición al siguiente servidor
    return db.setValor(id_entrevista, id_valor, valor, valorTexto);
}
  