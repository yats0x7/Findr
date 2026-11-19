import { Router } from 'express'
import {
  closeItem,
  createItem,
  editItem,
  getItem,
  getItems,
  getPossibleMatches,
  getSimilarItems,
} from '../controllers/itemController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// anyone can browse
router.get('/', getItems)
router.get('/:id', getItem)
router.get('/:id/similar', getSimilarItems)
router.get('/:id/matches', getPossibleMatches)

// changing things needs an account
router.post('/', requireAuth, createItem)
router.patch('/:id', requireAuth, editItem)
router.post('/:id/close', requireAuth, closeItem)

export default router
