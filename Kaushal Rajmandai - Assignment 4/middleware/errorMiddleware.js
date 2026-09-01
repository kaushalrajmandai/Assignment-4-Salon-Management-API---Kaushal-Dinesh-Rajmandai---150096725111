const { sendError } = require('../utils/response');

const notFoundHandler = (req, res) => {
  sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return sendError(res, 400, 'Request body is not valid JSON');
  }

  const status = err.status || 500;
  const message = status === 500 ? err.message || 'Internal server error' : err.message;

  if (status === 500) {
    console.error('[ERROR]', err);
  }

  return sendError(res, status, message);
};

module.exports = { notFoundHandler, errorHandler };