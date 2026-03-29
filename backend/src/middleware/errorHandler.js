function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;

  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: error.message });
  }

  if (error.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate record detected' });
  }

  return res.status(status).json({
    success: false,
    message: error.message || 'Internal server error'
  });
}

module.exports = errorHandler;
