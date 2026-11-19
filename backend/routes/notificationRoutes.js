import { Router } from 'express'
import { readOne } from '../controllers/notificationController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/:id/read', requireAuth, readOne)

export default router
