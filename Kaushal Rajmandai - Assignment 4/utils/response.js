const sendSuccess = (res, status, data, message = 'Success') => {
  res.status(status).json({ data, message, status });
};

const sendError = (res, status, message) => {
  res.status(status).json({ error: message, status });
};

module.exports = { sendSuccess, sendError };