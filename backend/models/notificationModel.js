import { randomUUID } from 'node:crypto'
import { db } from './db.js'

// Notifications get created when something happens to a claim or a handover
export function addNotification({ userId, itemId = null, claimId = null, type, message }) {
  db.notifications.push({
    notification_id: randomUUID(),
    user_id: userId,
    related_item_id: itemId,
    related_claim_id: claimId,
    notification_type: type,
    message,
    is_read: false,
    created_at: new Date().toISOString(),
  })
}
