import { db } from '../models/db.js'

// Business rules shared by the controllers, in one place.
// The database triggers in dbms/03_schema.sql back most of them up in phase 5.

export function isActiveMember(userId, communityId) {
  return db.community_memberships.some(
    (row) => row.user_id === userId && row.community_id === communityId && row.membership_status === 'ACTIVE',
  )
}

export function isCommunityAdmin(userId, communityId) {
  return db.community_memberships.some(
    (row) =>
      row.user_id === userId &&
      row.community_id === communityId &&
      row.role === 'COMMUNITY_ADMIN' &&
      row.membership_status === 'ACTIVE',
  )
}

// Reports can only change while they're still open
export function isStillOpen(item) {
  return item.status === 'OPEN' || item.status === 'CLAIM_PENDING'
}
