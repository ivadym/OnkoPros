const fs = require('fs');
const jwt = require('jsonwebtoken');

var privateKey  = fs.readFileSync('./RSA/private.key');
var publicKey  = fs.readFileSync('./RSA/public.key');

/**
 * Genera un JWT asociado a un usuario determinado
 */
exports.generarJWT = function (req, res, next) {
  try {
    req.usuario.JWT = jwt.sign(
      { id: req.usuario.id },
      privateKey,
      {
        expiresIn: '2h',
        algorithm: 'RS256'
      }
    );
    res.status(200).json(req.usuario);
  } catch (error) {
    // TODO: Tratamiento error interno servidor
    res.sendStatus(500) // HTTP 500 Internal Server Error
  }
};

/**
 * Verifica el JWT asociado a un determinado cliente
 */
exports.verificarJWT = function (req, res, next) {
    try {
      var id = req.headers['id'];
      var token = req.headers['authorization'].split(' ')[1];
      jwt.verify(token, publicKey, function(err, decoded) {
        if (err) {
          // TODO: Mejor manejo errores
          res.sendStatus(403); // HTTP 403 Forbidden
        } else if(decoded) {
          if(decoded.id == id) {
            next();
          } else {
            // TODO: Mejor manejo errores
            res.sendStatus(403); // HTTP 403 Forbidden
          }
        } else {
          // TODO: Mejor manejo errores
          res.sendStatus(403); // HTTP 403 Forbidden
        }
      });
    } catch (error) {
        // TODO: Mejor manejo errores
        res.sendStatus(403); // HTTP 403 Forbidden
    }
};
