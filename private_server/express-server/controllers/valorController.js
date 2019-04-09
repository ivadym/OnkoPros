const valorData = require('../models/valorDB');

/**
 * Guarda la respuesta del usuario
 */
exports.setItemValor = function (req, res, next) {
    almacenarItemValor(req.idUsuario, req.body)
    .then(function(item) {
        if(item) {
            // TODO: Considerar más casos (múltiples alertas, alertas por ciertas reglas, etc.)
            var alerta = null;
            for (var i = 0; i < item.Valores.length; i++) {
                if(item.Valores[i].Alerta) {
                    alerta = 'Acuda al centro médico más cercano.'
                }
            }
            res.status(201).json({alerta: alerta, item: item});
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
function almacenarItemValor(idUsuario, item) {
    return valorData.setItemValor(idUsuario, item);
}
  