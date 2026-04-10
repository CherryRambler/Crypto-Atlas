/**
 * Global error handler middleware.
 * Ensures consistent JSON error responses across the entire API.
 */
export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url}:`, err.stack || err)

  const status = err.status || 500
  const message = err.message || 'Internal Server Error'

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
    // Only include stack trace in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })
}
