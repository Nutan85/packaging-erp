import { Router } from 'express'
import { getDatabaseHealth, getHealth } from '../controllers/healthController.js'

const healthRoutes = Router()

healthRoutes.get('/db', getDatabaseHealth)
healthRoutes.get('/', getHealth)

export { healthRoutes }
