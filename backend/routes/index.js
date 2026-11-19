import { Router } from 'express'
import adminRoutes from './adminRoutes.js'
import authRoutes from './authRoutes.js'
import claimRoutes from './claimRoutes.js'
import healthRoutes from './healthRoutes.js'
import itemRoutes from './itemRoutes.js'
import meRoutes from './meRoutes.js'
import notificationRoutes from './notificationRoutes.js'
import referenceRoutes from './referenceRoutes.js'

// Every route of the API lives under /api
const router = Router()

router.use('/health', healthRoutes)
router.use('/auth', authRoutes)
router.use('/me', meRoutes)
router.use('/items', itemRoutes)
router.use('/claims', claimRoutes)
router.use('/notifications', notificationRoutes)
router.use('/admin', adminRoutes)
router.use('/', referenceRoutes)

export default router
