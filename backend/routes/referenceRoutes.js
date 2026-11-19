import { Router } from 'express'
import { joinCommunity } from '../controllers/profileController.js'
import { getCategories, getCommunities } from '../controllers/referenceController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/categories', getCategories)
router.get('/communities', getCommunities)
router.post('/communities/:id/join', requireAuth, joinCommunity)

export default router
