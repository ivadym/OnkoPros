/**
 * HTTP 404 Not Found
 */
exports.notFound = (req, res, next) => {
  res.sendStatus(404);
};
