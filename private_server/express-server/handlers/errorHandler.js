/**
 * HTTP 404 Not Found
 */
function notFound(req, res, next) {
  res.sendStatus(404);
};

module.exports = { notFound }
