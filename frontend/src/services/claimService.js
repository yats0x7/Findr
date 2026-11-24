import { addNotification, copy, createId, db, getSessionUserId, networkDelay, requireUserId, saveDb } from './mockStore'
import { normaliseAnswer, toItemView } from './itemService'
import { whyCantClaim } from './rules'
import { sha256 } from '../utils/sha256'

// Claims on FOUND items. A claim only gets created after the owner's answer
// matches the finder's private question, like the schema expects
// (verification_passed_at is NOT NULL and the raw answer is never stored).

function findItemOrFail(itemId) {
  const item = db.items.find((row) => row.item_id === itemId)
  if (!item) {
    throw new Error('This item no longer exists.')
  }
  return item
}

// For the item page: can the current visitor claim this?
// Returns null if yes, otherwise { code, message } (see rules.js).
// phase 5: GET /api/items/:id/claim-status
export async function checkCanClaim(itemId) {
  await networkDelay(100)
  return copy(whyCantClaim(findItemOrFail(itemId), getSessionUserId()))
}

// What the claim form needs. The question text is only handed out to
// people who are allowed to claim, and the answer hash never leaves here.
// phase 5: GET /api/items/:id/claim-form
export async function getClaimForm(itemId) {
  await networkDelay()

  const item = findItemOrFail(itemId)
  const problem = whyCantClaim(item, getSessionUserId())
  const question = db.verification_questions.find((row) => row.item_id === itemId && row.is_active)

  return copy({
    item: toItemView(item),
    problem,
    question_text: problem ? null : question?.question_text ?? null,
  })
}

// Checks the answer and creates a PENDING claim. A wrong answer creates nothing.
// phase 5: POST /api/items/:id/claims
export async function submitClaim(itemId, answer) {
  await networkDelay(500)

  const userId = requireUserId()
  const item = findItemOrFail(itemId)

  const problem = whyCantClaim(item, userId)
  if (problem) {
    throw new Error(problem.message)
  }

  const question = db.verification_questions.find((row) => row.item_id === itemId && row.is_active)
  if (!question || sha256(normaliseAnswer(answer)) !== question.answer_hash) {
    throw new Error("That answer doesn't match. Check the spelling and try again.")
  }

  const now = new Date().toISOString()
  const claimant = db.users.find((user) => user.user_id === userId)
  const claim = {
    claim_id: createId('claim'),
    item_id: itemId,
    claimant_id: userId,
    verification_passed_at: now,
    status: 'PENDING',
    review_note: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: now,
    updated_at: now,
  }

  db.claims.push(claim)
  item.status = 'CLAIM_PENDING'
  item.updated_at = now
  addNotification({
    userId: item.reporter_id,
    itemId,
    claimId: claim.claim_id,
    type: 'CLAIM_SUBMITTED',
    message: `${claimant.full_name} claimed your ${item.title}.`,
  })
  saveDb()

  return copy(claim)
}

// Claims the logged in user made, newest first, with the item, the finder and the handover
// phase 5: GET /api/me/claims
export async function listMyClaims() {
  await networkDelay()

  const userId = requireUserId()
  const claims = db.claims
    .filter((claim) => claim.claimant_id === userId)
    .sort((claimA, claimB) => claimB.created_at.localeCompare(claimA.created_at))
    .map(withDetails)

  return copy(claims)
}

// A claimant can take back a claim the finder hasn't decided on yet
// phase 5: POST /api/claims/:id/withdraw
export async function withdrawClaim(claimId) {
  await networkDelay(300)

  const userId = requireUserId()
  const claim = db.claims.find((row) => row.claim_id === claimId)
  if (!claim || claim.claimant_id !== userId) {
    throw new Error('You can only withdraw your own claims.')
  }
  if (claim.status !== 'PENDING') {
    throw new Error('Only claims that are still waiting can be withdrawn.')
  }

  claim.status = 'WITHDRAWN'
  claim.updated_at = new Date().toISOString()
  reopenIfNoPendingClaims(claim.item_id)
  saveDb()
}

// CLAIM_PENDING goes back to OPEN once nobody is waiting any more
function reopenIfNoPendingClaims(itemId) {
  const item = db.items.find((row) => row.item_id === itemId)
  const stillPending = db.claims.some((claim) => claim.item_id === itemId && claim.status === 'PENDING')

  if (item.status === 'CLAIM_PENDING' && !stillPending) {
    item.status = 'OPEN'
    item.updated_at = new Date().toISOString()
  }
}

// ---------- Finder side (claim verification) ----------

function withDetails(claim) {
  const item = toItemView(db.items.find((row) => row.item_id === claim.item_id))
  const claimant = db.users.find((user) => user.user_id === claim.claimant_id)
  const handover = db.handovers.find((row) => row.claim_id === claim.claim_id) || null

  return {
    ...claim,
    item,
    finder_name: item.reporter_name,
    claimant_name: claimant.full_name,
    claimant_since: claimant.created_at,
    handover,
  }
}

// Claims on the logged in user's FOUND items, newest first
// phase 5: GET /api/me/claims-to-review
export async function listClaimsToReview() {
  await networkDelay()

  const userId = requireUserId()
  const myItemIds = db.items
    .filter((item) => item.reporter_id === userId && item.report_type === 'FOUND')
    .map((item) => item.item_id)

  const claims = db.claims
    .filter((claim) => myItemIds.includes(claim.item_id))
    .sort((claimA, claimB) => claimB.created_at.localeCompare(claimA.created_at))
    .map(withDetails)

  return copy(claims)
}

// Only the finder decides, and only on claims that are still waiting
function findClaimToReview(claimId, userId) {
  const claim = db.claims.find((row) => row.claim_id === claimId)
  const item = claim && db.items.find((row) => row.item_id === claim.item_id)

  if (!claim || item.reporter_id !== userId) {
    throw new Error('Only the person who found the item can review its claims.')
  }
  if (claim.status !== 'PENDING') {
    throw new Error('This claim was already decided.')
  }
  return { claim, item }
}

// Approving one claim rejects the others still waiting (one approved claim per item)
// phase 5: POST /api/claims/:id/approve
export async function approveClaim(claimId, note = '') {
  await networkDelay(300)

  const userId = requireUserId()
  const { claim, item } = findClaimToReview(claimId, userId)
  if (db.claims.some((row) => row.item_id === item.item_id && row.status === 'APPROVED')) {
    throw new Error('You already approved a claim on this item.')
  }

  const now = new Date().toISOString()
  decide(claim, 'APPROVED', note.trim() || null, userId, now)
  addNotification({
    userId: claim.claimant_id,
    itemId: item.item_id,
    claimId,
    type: 'CLAIM_APPROVED',
    message: `Your claim on the ${item.title} was approved. Arrange the handover with the finder.`,
  })

  for (const other of db.claims) {
    if (other.item_id === item.item_id && other.status === 'PENDING') {
      decide(other, 'REJECTED', 'Another claim on this item was approved.', userId, now)
      addNotification({
        userId: other.claimant_id,
        itemId: item.item_id,
        claimId: other.claim_id,
        type: 'CLAIM_REJECTED',
        message: `Your claim on the ${item.title} was not approved.`,
      })
    }
  }

  item.status = 'CLAIM_APPROVED'
  item.updated_at = now
  saveDb()
}

// phase 5: POST /api/claims/:id/reject
export async function rejectClaim(claimId, note = '') {
  await networkDelay(300)

  const userId = requireUserId()
  const { claim, item } = findClaimToReview(claimId, userId)

  decide(claim, 'REJECTED', note.trim() || null, userId, new Date().toISOString())
  addNotification({
    userId: claim.claimant_id,
    itemId: item.item_id,
    claimId,
    type: 'CLAIM_REJECTED',
    message: `Your claim on the ${item.title} was not approved.`,
  })
  reopenIfNoPendingClaims(item.item_id)
  saveDb()
}

function decide(claim, status, note, reviewerId, now) {
  claim.status = status
  claim.review_note = note
  claim.reviewed_by = reviewerId
  claim.reviewed_at = now
  claim.updated_at = now
}
