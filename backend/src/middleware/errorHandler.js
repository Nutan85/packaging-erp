import { env } from '../config/env.js'

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.isProduction ? {} : { stack: err.stack }),
  })
}
