const fs = require('fs');
const jwt = require('jsonwebtoken');

const { adaptarPerfilSql } = require('../helpers/helper');
const { logger } = require('../helpers/logger');

var privateKey  = fs.readFileSync('./RSA/private.key');
var publicKey  = fs.readFileSync('./RSA/public.key');

/**
 * Genera un JWT asociado a un usuario determinado
 */
function generarJWT(req, res, next) {
  logger.info('jwtController.generarJWT');
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
    logger.error('jwtController.generarJWT.500');
    var err = new Error(error.message ? error.message : error);
    err.statusCode = 500; // HTTP 500 Internal Server Error
    next(err);
  }
};

/**
 * Verifica el JWT asociado a un determinado cliente
 */
function verificarJWT(req, res, next) {
  logger.info('jwtController.verificarJWT');
  try {
    var idUsuario = req.headers['id'];
    var idPerfil = adaptarPerfilSql(req.headers['perfil']);
    var token = req.headers['authorization'].split(' ')[1];
    jwt.verify(token, publicKey, function(err, decoded) {
      if (err || !decoded) {
        logger.error('jwtController.verificarJWT.403');
        var err = new Error('Forbidden');
        err.statusCode = 403; // HTTP 403 Forbidden
        next(err);
      } else if (decoded && decoded.id == idUsuario) {
        req.idUsuario = decoded.id;
        req.idPerfil = idPerfil;
        next();
      } else {
        logger.error('jwtController.verificarJWT.403.1');
        var err = new Error('Forbidden');
        err.statusCode = 403; // HTTP 403 Forbidden
        next(err);
      }
    });
  } catch (error) {
    logger.error('jwtController.verificarJWT.500');
    var err = new Error(error.message ? error.message : error);
    err.statusCode = 500; // HTTP 500 Internal Server Error
    next(err);
  }
};

module.exports = { generarJWT, verificarJWT }
