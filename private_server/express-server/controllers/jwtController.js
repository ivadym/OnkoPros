const fs = require('fs');
const jwt = require('jsonwebtoken');

const helpers = require('../helpers/helpers')

var privateKey  = fs.readFileSync('./RSA/private.key');
var publicKey  = fs.readFileSync('./RSA/public.key');

/**
 * Genera un JWT asociado a un usuario determinado
 */
function generarJWT(req, res, next) {
  try {
    req.usuario.JWT = jwt.sign(
      { id: req.usuario.IdUsuario },
      privateKey,
      {
        expiresIn: '24h',
        algorithm: 'RS256'
      }
    );
    res.status(200).json(req.usuario);
  } catch (error) {
    var err = new Error(error.message ? error.message : error);
    err.statusCode = 500; // HTTP 500 Internal Server Error
    next(err);
  }
};

/**
 * Verifica el JWT asociado a un determinado cliente
 */
function verificarJWT(req, res, next) {
  try {
    var idUsuario = req.headers['id'];
    var idPerfil = helpers.adaptarPerfilSql(req.headers['perfil']);
    var token = req.headers['authorization'].split(' ')[1];
    jwt.verify(token, publicKey, function(err, decoded) {
      if (err || !decoded) {
        var err = new Error("Forbidden");
        err.statusCode = 403; // HTTP 403 Forbidden
        next(err);
      } else if (decoded && decoded.id == idUsuario) {
        req.idUsuario = decoded.id;
        req.idPerfil = idPerfil;
        next();
      } else {
        var err = new Error("Forbidden");
        err.statusCode = 403; // HTTP 403 Forbidden
        next(err);
      }
    });
  } catch (error) {
    var err = new Error(error.message ? error.message : error);
    err.statusCode = 500; // HTTP 500 Internal Server Error
    next(err);
  }
};

module.exports = { generarJWT, verificarJWT }
