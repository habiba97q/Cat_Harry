// src/middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err);
  const status = err.statusCode
    || (err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 0)
    || (err.code === 11000 ? 409 : 0)
    || (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE' ? 413 : 0)
    || (err.name === 'MulterError' ? 400 : 500);
  const message = status >= 500 && process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';
  // In production hide stack trace
  const response = { success: false, message };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }
  res.status(status).json(response);
};
