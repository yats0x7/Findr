import { Router } from 'express'
import {
  addPhotos,
  closeItem,
  createItem,
  editItem,
  getItem,
  getItems,
  getPossibleMatches,
  getSimilarItems,
} from '../controllers/itemController.js'
import { getClaimForm, getClaimStatus, submitClaim } from '../controllers/claimController.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import { uploadPhotos } from '../middleware/upload.js'

const router = Router()

// anyone can browse
router.get('/', getItems)
router.get('/:id', getItem)
router.get('/:id/similar', getSimilarItems)
router.get('/:id/matches', getPossibleMatches)

// changing things needs an account
// login is checked before the upload, so guests can't fill the disk
router.post('/', requireAuth, uploadPhotos, createItem)
router.post('/:id/photos', requireAuth, uploadPhotos, addPhotos)
router.patch('/:id', requireAuth, editItem)
router.post('/:id/close', requireAuth, closeItem)

// claiming a found item
router.get('/:id/claim-status', optionalAuth, getClaimStatus)
router.get('/:id/claim-form', requireAuth, getClaimForm)
router.post('/:id/claims', requireAuth, submitClaim)

export default router
