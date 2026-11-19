import { findClaim, toClaimView } from '../models/claimModel.js'
import { cancelHandover, completeHandover, findHandoverForClaim, scheduleHandover } from '../models/handoverModel.js'
import { findItem, setItemStatus } from '../models/itemModel.js'
import { addNotification } from '../models/notificationModel.js'
import { HttpError } from '../utils/httpError.js'
import { text } from '../utils/validators.js'

// Only an APPROVED claim has a handover, and only the finder and the owner can touch it
function approvedClaimFor(req) {
  const claim = findClaim(req.params.id)
  const item = claim && findItem(claim.item_id)
  const userId = req.user.user_id

  if (!claim || (userId !== item.reporter_id && userId !== claim.claimant_id)) {
    throw new HttpError(404, 'Claim not found.')
  }
  if (claim.status !== 'APPROVED') {
    throw new HttpError(409, 'Only an approved claim can have a handover.')
  }
  return { claim, item, isFinder: userId === item.reporter_id }
}

function whenText(isoDate) {
  return new Date(isoDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}

// the person on the other side gets told about changes
function notifyOtherSide({ claim, item, isFinder }, type, message) {
  addNotification({
    userId: isFinder ? claim.claimant_id : item.reporter_id,
    itemId: item.item_id,
    claimId: claim.claim_id,
    type,
    message,
  })
}

// PUT /api/claims/:id/handover  { scheduled_at, handover_location }
// The finder or the owner sets (or changes) when and where to meet.
export function setHandover(req, res) {
  const found = approvedClaimFor(req)
  const scheduledAt = text(req.body.scheduled_at)
  const location = text(req.body.handover_location)

  if (found.item.status === 'RETURNED') {
    throw new HttpError(409, 'This item was already returned.')
  }

  const fields = {}
  const time = Date.parse(scheduledAt)
  if (Number.isNaN(time)) {
    fields.scheduled_at = 'Choose a date and time.'
  } else if (time < Date.now()) {
    fields.scheduled_at = 'Pick a time in the future.'
  }
  if (!location || location.length > 240) {
    fields.handover_location = 'Say where to meet, up to 240 characters.'
  }
  if (Object.keys(fields).length > 0) {
    throw new HttpError(422, 'Some details need fixing.', fields)
  }

  const handover = scheduleHandover(found.claim.claim_id, new Date(time).toISOString(), location)
  notifyOtherSide(
    found,
    'HANDOVER_SCHEDULED',
    `Handover for the ${found.item.title} set for ${whenText(handover.scheduled_at)} at ${location}.`,
  )

  res.json({ claim: toClaimView(found.claim) })
}

// POST /api/claims/:id/handover/complete  { note? }
// The finder confirms they gave it back. The item becomes RETURNED and stops taking claims.
export function finishHandover(req, res) {
  const found = approvedClaimFor(req)
  if (!found.isFinder) {
    throw new HttpError(403, 'Only the finder can mark the item as returned.')
  }

  const handover = findHandoverForClaim(found.claim.claim_id)
  if (!handover || handover.status !== 'SCHEDULED') {
    throw new HttpError(409, 'Set up the handover first.')
  }

  completeHandover(handover, text(req.body?.note))
  setItemStatus(found.item, 'RETURNED')
  notifyOtherSide(found, 'HANDOVER_COMPLETED', `Handover complete. The ${found.item.title} is marked returned.`)

  res.json({ claim: toClaimView(found.claim) })
}

// POST /api/claims/:id/handover/cancel
// Either side can call it off. The claim stays approved so they can pick a new time.
export function callOffHandover(req, res) {
  const found = approvedClaimFor(req)
  const handover = findHandoverForClaim(found.claim.claim_id)
  if (!handover || handover.status !== 'SCHEDULED') {
    throw new HttpError(409, 'There is no handover to cancel.')
  }

  cancelHandover(handover)
  notifyOtherSide(
    found,
    'HANDOVER_CANCELLED',
    `The handover for the ${found.item.title} was cancelled. Pick a new time from your dashboard.`,
  )

  res.json({ claim: toClaimView(found.claim) })
}
