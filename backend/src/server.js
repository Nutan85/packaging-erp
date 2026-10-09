import { app } from './app.js'
import { env } from './config/env.js'

const server = app.listen(env.port, () => {
  console.log(
    `Backend listening on http://localhost:${env.port} (${env.nodeEnv})`,
  )
})

server.on('error', (error) => {
  console.error('Failed to start backend:', error.message)
  process.exit(1)
})
