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

// Where clicking a notification should take you in the frontend:
// finders go to claim verification, claimants to My claims
function linkFor(notification, userId) {
  const item = db.items.find((row) => row.item_id === notification.related_item_id)
  if (!item) {
    return '/dashboard'
  }
  if (!notification.related_claim_id) {
    return `/items/${item.item_id}`
  }
  return item.reporter_id === userId ? `/dashboard/verification?item=${item.item_id}` : '/dashboard/claims'
}

function mine(userId) {
  return db.notifications.filter((row) => row.user_id === userId)
}

// newest first, each with a `link`
export function listNotifications(userId) {
  return mine(userId)
    .sort((rowA, rowB) => rowB.created_at.localeCompare(rowA.created_at))
    .map((notification) => ({ ...notification, link: linkFor(notification, userId) }))
}

export function countUnread(userId) {
  return mine(userId).filter((row) => !row.is_read).length
}

// false if it isn't one of this user's notifications
export function markRead(userId, notificationId) {
  const notification = mine(userId).find((row) => row.notification_id === notificationId)
  if (!notification) {
    return false
  }
  notification.is_read = true
  return true
}

export function markAllRead(userId) {
  for (const notification of mine(userId)) {
    notification.is_read = true
  }
}
