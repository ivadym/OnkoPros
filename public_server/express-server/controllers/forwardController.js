const fs   = require('fs');
const request = require('request');

const privateServerURL = 'https://localhost:8443';

/**
 * Lleva a cabo el reenvío de la petición completa al servidor privado
 */
function reenviar(req, res, next) {
    const options = {
        url: privateServerURL + req.url,
        headers: {
            'id': req.headers.id,
            'perfil': req.headers.perfil,
            'authorization': req.headers.authorization
        },
        json: req.body,
        ca: fs.readFileSync('C:/Users/vivanchuk/Documents/ws-OnkoPros/private_server/nginx/ssl/cert.pem'),
        agentOptions: { checkServerIdentity: function() {} }
    };

    if (req.method === 'POST') {
        request.post(options, function optionalCallback(error, response, body) {
            if (error) {
                var err = new Error(error.message ? error.message : error);
                err.statusCode = 500; // HTTP 500 Internal Server Error
                next(err);
            } else {
                res.status(response.statusCode).json(body);
            }
        });
    } else if (req.method === 'GET') {
        request.get(options, function optionalCallback(error, response, body) {
            if (error) {
                var err = new Error(error.message ? error.message : error);
                err.statusCode = 500; // HTTP 500 Internal Server Error
                next(err);
            } else {
                res.status(response.statusCode).json(body);
            }
        });
    }
}

module.exports = { reenviar }
