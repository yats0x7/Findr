import { Router } from 'express'
import authRoutes from './authRoutes.js'
import healthRoutes from './healthRoutes.js'
import itemRoutes from './itemRoutes.js'
import meRoutes from './meRoutes.js'
import referenceRoutes from './referenceRoutes.js'

// Every route of the API lives under /api
const router = Router()

router.use('/health', healthRoutes)
router.use('/auth', authRoutes)
router.use('/me', meRoutes)
router.use('/items', itemRoutes)
router.use('/', referenceRoutes)

export default router
