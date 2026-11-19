import { randomUUID } from 'node:crypto'
import { db } from './db.js'
import { toItemView } from './itemModel.js'

export function findClaim(claimId) {
  return db.claims.find((row) => row.claim_id === claimId) || null
}

// PENDING and APPROVED count as "active" (same as the unique index in the schema)
export function findActiveClaim(itemId, userId) {
  return (
    db.claims.find(
      (claim) => claim.item_id === itemId && claim.claimant_id === userId && ['PENDING', 'APPROVED'].includes(claim.status),
    ) || null
  )
}

export function listClaimsForItem(itemId) {
  return db.claims.filter((claim) => claim.item_id === itemId)
}

// Only call this after the answer matched: verification_passed_at is NOT NULL in the schema
export function insertClaim(itemId, claimantId) {
  const now = new Date().toISOString()
  const claim = {
    claim_id: randomUUID(),
    item_id: itemId,
    claimant_id: claimantId,
    verification_passed_at: now,
    status: 'PENDING',
    review_note: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: now,
    updated_at: now,
  }
  db.claims.push(claim)
  return claim
}

// APPROVED or REJECTED, by the finder
export function decideClaim(claim, status, note, reviewerId) {
  const now = new Date().toISOString()
  Object.assign(claim, { status, review_note: note || null, reviewed_by: reviewerId, reviewed_at: now, updated_at: now })
}

export function withdrawClaim(claim) {
  claim.status = 'WITHDRAWN'
  claim.updated_at = new Date().toISOString()
}

// A claim plus the item, both people's names and the handover (if there is one)
export function toClaimView(claim) {
  const item = toItemView(db.items.find((row) => row.item_id === claim.item_id))
  const claimant = db.users.find((row) => row.user_id === claim.claimant_id)
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

function newestFirst(claimA, claimB) {
  return claimB.created_at.localeCompare(claimA.created_at)
}

// Claims a user made
export function listClaimsBy(userId) {
  return db.claims.filter((claim) => claim.claimant_id === userId).sort(newestFirst).map(toClaimView)
}

// Claims on the FOUND items a user reported (what they review as the finder)
export function listClaimsToReview(finderId) {
  const myItemIds = db.items
    .filter((item) => item.reporter_id === finderId && item.report_type === 'FOUND')
    .map((item) => item.item_id)

  return db.claims.filter((claim) => myItemIds.includes(claim.item_id)).sort(newestFirst).map(toClaimView)
}
