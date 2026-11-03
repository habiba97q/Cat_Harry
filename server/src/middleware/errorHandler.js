// src/middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  // In production hide stack trace
  const response = { success: false, message };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }
  res.status(status).json(response);
};
