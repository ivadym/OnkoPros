const fs   = require('fs');
const jwt = require('jsonwebtoken');

var privateKEY  = fs.readFileSync('./RSA/private.key', 'utf8');
var publicKEY  = fs.readFileSync('./RSA/public.key', 'utf8');

/**
 * Genera un JWT asociado a un usuario determinado
 */
exports.generarJWT = function (req, res, next) {
  try {
    var token = jwt.sign(
      { usuario: req.usuario.id },
      privateKEY,
      {
        expiresIn: '2h',
        algorithm: 'RS256'
      }
    );
    // TODO: Filtrar los datos que son necesarios enviar en primera instancia
    res.status(200).json({
      usuario: req.usuario,
      jwt: token
    });
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
        var token = req.headers['authorization'].split(' ')[1];
        jwt.verify(token, publicKEY);
        next();
    } catch (error) {
        // TODO: Solicitar a Angular que cierre sesión (lado cliente)
        // TODO: Mejor manejo errores
        res.sendStatus(403); // HTTP 403 Forbidden
    }
};
