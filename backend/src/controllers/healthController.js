import { env } from '../config/env.js'
import { testDatabaseConnection } from '../config/db.js'

export function getHealth(req, res) {
  res.status(200).json({
    success: true,
    message: 'Packaging Industry ERP backend is running',
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}

export async function getDatabaseHealth(req, res) {
  try {
    await testDatabaseConnection()

    res.status(200).json({
      success: true,
      message: 'MySQL connection successful',
      status: 'ok',
      database: env.db.name,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'MySQL connection failed',
      status: 'error',
      database: env.db.name,
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}
