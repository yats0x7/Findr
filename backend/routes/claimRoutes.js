import { Router } from 'express'
import { approve, reject, withdraw } from '../controllers/claimController.js'
import { requireAuth } from '../middleware/auth.js'

// /api/claims/:id/...  every action on a claim needs a login
const router = Router()
router.use(requireAuth)

router.post('/:id/withdraw', withdraw)
router.post('/:id/approve', approve)
router.post('/:id/reject', reject)

export default router
