import { Router } from 'express'
import { approve, reject, withdraw } from '../controllers/claimController.js'
import { callOffHandover, finishHandover, setHandover } from '../controllers/handoverController.js'
import { requireAuth } from '../middleware/auth.js'

// /api/claims/:id/...  every action on a claim needs a login
const router = Router()
router.use(requireAuth)

router.post('/:id/withdraw', withdraw)
router.post('/:id/approve', approve)
router.post('/:id/reject', reject)

// the handover for an approved claim
router.put('/:id/handover', setHandover)
router.post('/:id/handover/complete', finishHandover)
router.post('/:id/handover/cancel', callOffHandover)

export default router
