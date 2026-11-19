import { randomUUID } from 'node:crypto'
import { db } from './db.js'

// One handover per approved claim (claim_id is UNIQUE in the schema)
export function findHandoverForClaim(claimId) {
  return db.handovers.find((row) => row.claim_id === claimId) || null
}

// Creates the handover, or moves an existing one to a new time and place
export function scheduleHandover(claimId, scheduledAt, location) {
  let handover = findHandoverForClaim(claimId)
  if (!handover) {
    handover = { handover_id: randomUUID(), claim_id: claimId, completed_at: null, confirmation_note: null }
    db.handovers.push(handover)
  }

  Object.assign(handover, { scheduled_at: scheduledAt, handover_location: location, status: 'SCHEDULED' })
  return handover
}

// COMPLETED needs completed_at (schema CHECK)
export function completeHandover(handover, note) {
  Object.assign(handover, { status: 'COMPLETED', completed_at: new Date().toISOString(), confirmation_note: note || null })
}

export function cancelHandover(handover) {
  handover.status = 'CANCELLED'
}
