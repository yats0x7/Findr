import { countUnread, listNotifications, markAllRead, markRead } from '../models/notificationModel.js'
import { HttpError } from '../utils/httpError.js'

// GET /api/me/notifications
export function getNotifications(req, res) {
  res.json({ notifications: listNotifications(req.user.user_id) })
}

// GET /api/me/notifications/unread-count  for the number on the bell
export function getUnreadCount(req, res) {
  res.json({ unread: countUnread(req.user.user_id) })
}

// POST /api/notifications/:id/read
export function readOne(req, res) {
  if (!markRead(req.user.user_id, req.params.id)) {
    throw new HttpError(404, 'Notification not found.')
  }
  res.status(204).end()
}

// POST /api/me/notifications/read-all
export function readAll(req, res) {
  markAllRead(req.user.user_id)
  res.status(204).end()
}
