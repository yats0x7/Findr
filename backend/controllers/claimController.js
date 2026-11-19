import {
  decideClaim,
  findClaim,
  insertClaim,
  listClaimsBy,
  listClaimsForItem,
  listClaimsToReview,
  toClaimView,
  withdrawClaim,
} from '../models/claimModel.js'
import { findActiveQuestion, findItem, setItemStatus, toItemView } from '../models/itemModel.js'
import { addNotification } from '../models/notificationModel.js'
import { checkAnswer } from '../services/answers.js'
import { createAttemptLimiter } from '../services/attemptLimiter.js'
import { whyCantClaim } from '../services/rules.js'
import { HttpError } from '../utils/httpError.js'
import { text } from '../utils/validators.js'

// 5 wrong answers on one item locks that person out of it for an hour,
// so nobody can guess their way through the private question
const answerLimiter = createAttemptLimiter({
  maxFailures: 5,
  windowMinutes: 60,
  message: 'Too many wrong answers for this item. Try again in an hour.',
})

function itemOr404(itemId) {
  const item = findItem(itemId)
  if (!item) {
    throw new HttpError(404, 'Item not found.')
  }
  return item
}

// CLAIM_PENDING goes back to OPEN once nobody is waiting any more
function reopenIfNoPendingClaims(item) {
  const stillPending = listClaimsForItem(item.item_id).some((claim) => claim.status === 'PENDING')
  if (item.status === 'CLAIM_PENDING' && !stillPending) {
    setItemStatus(item, 'OPEN')
  }
}

// ---------- Claimant side ----------

// GET /api/items/:id/claim-status  can the visitor claim this? (works for guests too)
export function getClaimStatus(req, res) {
  const item = itemOr404(req.params.id)
  const problem = whyCantClaim(item, req.user?.user_id ?? null)
  res.json({ canClaim: problem === null, problem })
}

// GET /api/items/:id/claim-form
// The question text only goes to people who are allowed to claim. The answer hash never leaves.
export function getClaimForm(req, res) {
  const item = itemOr404(req.params.id)
  const problem = whyCantClaim(item, req.user.user_id)
  const question = findActiveQuestion(item.item_id)

  res.json({
    item: toItemView(item),
    problem,
    question_text: problem ? null : (question?.question_text ?? null),
  })
}

// POST /api/items/:id/claims  { answer }
// Checks the answer first. A wrong answer creates nothing.
export async function submitClaim(req, res) {
  const item = itemOr404(req.params.id)
  const userId = req.user.user_id
  const answer = text(req.body.answer)

  const problem = whyCantClaim(item, userId)
  if (problem) {
    throw new HttpError(problem.code === 'not-member' ? 403 : 409, problem.message)
  }
  if (!answer) {
    throw new HttpError(422, 'Type your answer.', { answer: 'Type your answer.' })
  }

  const limiterKey = `${userId}:${item.item_id}`
  answerLimiter.check(limiterKey)

  const question = findActiveQuestion(item.item_id)
  if (!question || !(await checkAnswer(answer, question.answer_hash))) {
    answerLimiter.fail(limiterKey)
    throw new HttpError(422, "That answer doesn't match. Check the spelling and try again.", {
      answer: "That answer doesn't match.",
    })
  }
  answerLimiter.reset(limiterKey)

  const claim = insertClaim(item.item_id, userId)
  setItemStatus(item, 'CLAIM_PENDING')
  addNotification({
    userId: item.reporter_id,
    itemId: item.item_id,
    claimId: claim.claim_id,
    type: 'CLAIM_SUBMITTED',
    message: `${req.user.full_name} claimed your ${item.title}.`,
  })

  res.status(201).json({ claim: toClaimView(claim) })
}

// GET /api/me/claims
export function getMyClaims(req, res) {
  res.json({ claims: listClaimsBy(req.user.user_id) })
}

// POST /api/claims/:id/withdraw  the claimant takes back a claim that's still waiting
export function withdraw(req, res) {
  const claim = findClaim(req.params.id)
  if (!claim || claim.claimant_id !== req.user.user_id) {
    throw new HttpError(404, 'Claim not found.')
  }
  if (claim.status !== 'PENDING') {
    throw new HttpError(409, 'Only claims that are still waiting can be withdrawn.')
  }

  withdrawClaim(claim)
  reopenIfNoPendingClaims(findItem(claim.item_id))
  res.json({ claim: toClaimView(claim) })
}

// ---------- Finder side ----------

// GET /api/me/claims-to-review  claims on the FOUND items you reported
export function getClaimsToReview(req, res) {
  res.json({ claims: listClaimsToReview(req.user.user_id) })
}

// Only the finder decides, and only on claims that are still waiting
function claimToReview(req) {
  const claim = findClaim(req.params.id)
  const item = claim && findItem(claim.item_id)
  if (!claim || item.reporter_id !== req.user.user_id) {
    throw new HttpError(403, 'Only the person who found the item can review its claims.')
  }
  if (claim.status !== 'PENDING') {
    throw new HttpError(409, 'This claim was already decided.')
  }
  return { claim, item }
}

// POST /api/claims/:id/approve  { note? }
// One approved claim per item, so the others still waiting get rejected.
export function approve(req, res) {
  const { claim, item } = claimToReview(req)
  const finderId = req.user.user_id

  if (listClaimsForItem(item.item_id).some((row) => row.status === 'APPROVED')) {
    throw new HttpError(409, 'You already approved a claim on this item.')
  }

  decideClaim(claim, 'APPROVED', text(req.body?.note), finderId)
  addNotification({
    userId: claim.claimant_id,
    itemId: item.item_id,
    claimId: claim.claim_id,
    type: 'CLAIM_APPROVED',
    message: `Your claim on the ${item.title} was approved. Arrange the handover with the finder.`,
  })

  for (const other of listClaimsForItem(item.item_id)) {
    if (other.status === 'PENDING') {
      decideClaim(other, 'REJECTED', 'Another claim on this item was approved.', finderId)
      addNotification({
        userId: other.claimant_id,
        itemId: item.item_id,
        claimId: other.claim_id,
        type: 'CLAIM_REJECTED',
        message: `Your claim on the ${item.title} was not approved.`,
      })
    }
  }

  setItemStatus(item, 'CLAIM_APPROVED')
  res.json({ claim: toClaimView(claim) })
}

// POST /api/claims/:id/reject  { note? }
export function reject(req, res) {
  const { claim, item } = claimToReview(req)

  decideClaim(claim, 'REJECTED', text(req.body?.note), req.user.user_id)
  addNotification({
    userId: claim.claimant_id,
    itemId: item.item_id,
    claimId: claim.claim_id,
    type: 'CLAIM_REJECTED',
    message: `Your claim on the ${item.title} was not approved.`,
  })
  reopenIfNoPendingClaims(item)

  res.json({ claim: toClaimView(claim) })
}

// Used by closeItem: a closed report can't keep claims waiting
export function rejectWaitingClaims(item) {
  for (const claim of listClaimsForItem(item.item_id)) {
    if (claim.status === 'PENDING') {
      // the schema only lets the finder review a claim
      decideClaim(claim, 'REJECTED', 'The report was closed.', item.reporter_id)
      addNotification({
        userId: claim.claimant_id,
        itemId: item.item_id,
        claimId: claim.claim_id,
        type: 'CLAIM_REJECTED',
        message: `The ${item.title} report was closed, so your claim was closed too.`,
      })
    }
  }
}
