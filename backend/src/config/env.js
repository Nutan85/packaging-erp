import dotenv from 'dotenv'

dotenv.config()

const nodeEnv = process.env.NODE_ENV || 'development'
const port = Number.parseInt(process.env.PORT, 10) || 5000
const dbPort = Number.parseInt(process.env.DB_PORT, 10) || 3306

export const env = {
  nodeEnv,
  port,
  isProduction: nodeEnv === 'production',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: dbPort,
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_NAME || '',
  },
}
