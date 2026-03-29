const logger = require('../utils/logger');

/**
 * Standardized API error response
 */
function errorResponse(res, statusCode, message, details = null) {
  const body = {
    success: false,
    error: { code: statusCode, message },
    timestamp: new Date().toISOString(),
  };
  if (details) body.error.details = details;
  return res.status(statusCode).json(body);
}

/**
 * Standardized API success response
 */
function successResponse(res, data, meta = {}) {
  return res.json({
    success: true,
    data,
    meta: { ...meta, timestamp: new Date().toISOString() },
  });
}

/**
 * Global error handler middleware
 */
function globalErrorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Unhandled error', {
    path: req.path,
    method: req.method,
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  return errorResponse(res, statusCode, message, err.details || null);
}

/**
 * 404 handler for unknown routes
 */
function notFoundHandler(req, res) {
  return errorResponse(res, 404, `Route ${req.method} ${req.path} not found`);
}

/**
 * Async route wrapper to avoid try/catch in every handler
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorResponse, successResponse, globalErrorHandler, notFoundHandler, asyncHandler };