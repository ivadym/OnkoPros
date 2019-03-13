const valorData = require('../models/valorDB');

/**
 * Guarda la respuesta del usuario
 */
exports.setValor = function (req, res, next) {
    var valor = {
        'id': req.body.id,
        'titulo': req.body.titulo,
        'tipo': req.body.tipo,
        'valores': req.body.valores
    }
    almacenarValor(valor)
    .then(function(valor) {
        if(valor) {
            var alerta = null;
            if(valor.valores.includes('Opción 2')) {
                alerta = 'Acuda al centro médico más cercano.'
            }
            res.status(201).json({alerta: alerta, valor: valor});
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
function almacenarValor(valor) {
    return valorData.setValor(valor);
}
  