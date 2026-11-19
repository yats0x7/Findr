import { Router } from 'express'
import { getClaims, getItems, getMembers, getOverview, setMemberStatus } from '../controllers/adminController.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

// /api/admin/...  community admins only
const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/overview', getOverview)
router.get('/members', getMembers)
router.patch('/members/:id', setMemberStatus)
router.get('/items', getItems)
router.get('/claims', getClaims)

export default router
