import { Router } from 'express'
import { getMe } from '../controllers/authController.js'
import { getClaimsToReview, getMyClaims } from '../controllers/claimController.js'
import { getMyItems } from '../controllers/itemController.js'
import { requireAuth } from '../middleware/auth.js'

// Everything under /api/me is about the logged in user
const router = Router()
router.use(requireAuth)

router.get('/', getMe)
router.get('/items', getMyItems)
router.get('/claims', getMyClaims)
router.get('/claims-to-review', getClaimsToReview)

export default router
