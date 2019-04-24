const itemData = require('../models/itemDB');
const entrevistaData = require('../models/entrevistasDB');

/**
 * Devuelve la siguiente pregunta disponible
 */
exports.getItem = function (req, res, next) {
    extraerItem(req.idUsuario, req.idPerfil, req.params['id'])
    .then(function(item) {
        if(item && item.length == 2) {
            entrevistaData.extraerTituloEntrevista(item[0])
            .then(function(tituloPadre) {
                res.status(200).json({
                    item: item[1],
                    idPadre: item[0],
                    tituloPadre: tituloPadre
                });
            })
            .catch(function(error) {
                res.status(200).json(null);
            });
        } else if(item) {
            res.status(200).json({
                item: item,
                idPadre: null,
                tituloPadre: null
            });
        } else {
            res.status(200).json(null);
        }
    })
    .catch(function(error) {
        // TODO: Mejor manejo de errores
        res.sendStatus(500); // HTTP 500 Internal Server Error
    });
};

/**
 * Extrae el siguiente item disponible
 */
function extraerItem(idUsuario, idPerfil, idEntrevista) {
    return itemData.extraerItem(idUsuario, idPerfil, idEntrevista);
}
