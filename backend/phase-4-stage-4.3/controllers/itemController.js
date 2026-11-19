import {
  findItem,
  insertItem,
  listItems,
  listPossibleMatches,
  listReportsBy,
  listSimilarItems,
  setItemStatus,
  toItemView,
  updateItem,
} from '../models/itemModel.js'
import { hashAnswer } from '../services/answers.js'
import { isActiveMember, isCommunityAdmin, isStillOpen } from '../services/rules.js'
import { HttpError } from '../utils/httpError.js'
import { checkItemDetails, checkPin, checkQuestion } from '../utils/itemValidation.js'
import { text } from '../utils/validators.js'

const STATUSES = ['OPEN', 'CLAIM_PENDING', 'CLAIM_APPROVED', 'RETURNED', 'CLOSED']

function reportTypeFrom(value) {
  const type = text(value).toUpperCase()
  return type === 'LOST' || type === 'FOUND' ? type : ''
}

function itemOr404(itemId) {
  const item = findItem(itemId)
  if (!item) {
    throw new HttpError(404, 'Item not found.')
  }
  return item
}

// GET /api/items?search=&type=lost&category=&community=&status=&from=&to=&location=&hasLocation=true&sort=oldest&page=1&limit=20
export function getItems(req, res) {
  const query = req.query
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1)
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 20))
  const status = text(query.status).toUpperCase()

  const { items, total } = listItems({
    search: text(query.search),
    reportType: reportTypeFrom(query.type),
    categoryId: text(query.category),
    communityId: text(query.community),
    status: STATUSES.includes(status) ? status : '',
    dateFrom: text(query.from),
    dateTo: text(query.to),
    location: text(query.location),
    hasLocation: query.hasLocation === 'true',
    sort: query.sort === 'oldest' ? 'oldest' : 'newest',
    page,
    limit,
  })

  res.json({ items, total, page, limit })
}

// GET /api/items/:id
export function getItem(req, res) {
  res.json({ item: toItemView(itemOr404(req.params.id)) })
}

// GET /api/items/:id/similar
export function getSimilarItems(req, res) {
  res.json({ items: listSimilarItems(itemOr404(req.params.id), 4) })
}

// GET /api/items/:id/matches  found items that could be this lost one
export function getPossibleMatches(req, res) {
  const item = itemOr404(req.params.id)
  if (item.report_type !== 'LOST') {
    throw new HttpError(400, 'Matches are only for lost reports.')
  }
  res.json({ items: listPossibleMatches(item, 3) })
}

// POST /api/items  (needs login)
// { report_type, title, category_id, community_id, description, event_date,
//   location_label, latitude?, longitude?, question_text? answer? (FOUND only) }
export async function createItem(req, res) {
  const body = req.body
  const reportType = reportTypeFrom(body.report_type)
  const communityId = text(body.community_id)

  const { values, fields } = checkItemDetails(body)
  const pin = checkPin(body.latitude, body.longitude, fields)
  const question = reportType === 'FOUND' ? checkQuestion(body, fields) : null

  if (!reportType) {
    fields.report_type = 'Choose LOST or FOUND.'
  }
  if (!isActiveMember(req.user.user_id, communityId)) {
    fields.community_id = 'You can only report items in a community you belong to.'
  }
  if (Object.keys(fields).length > 0) {
    throw new HttpError(422, 'Some details need fixing.', fields)
  }

  const item = insertItem({
    item: { ...values, ...pin, report_type: reportType, community_id: communityId, reporter_id: req.user.user_id },
    // only the hash is stored, never the answer itself
    question: question && { question_text: question.question, answer_hash: await hashAnswer(question.answer) },
  })

  res.status(201).json({ item: toItemView(item) })
}

// PATCH /api/items/:id  (reporter only, while still open)
// Lost/found, the community and the private question can't change.
export function editItem(req, res) {
  const item = itemOr404(req.params.id)
  if (item.reporter_id !== req.user.user_id) {
    throw new HttpError(403, 'You can only change your own reports.')
  }
  if (!isStillOpen(item)) {
    throw new HttpError(409, 'This report is finished, so it can no longer be changed.')
  }

  const { values, fields } = checkItemDetails(req.body)
  if (Object.keys(fields).length > 0) {
    throw new HttpError(422, 'Some details need fixing.', fields)
  }

  res.json({ item: toItemView(updateItem(item, values)) })
}

// POST /api/items/:id/close  (the reporter or an admin of that community)
export function closeItem(req, res) {
  const item = itemOr404(req.params.id)
  const userId = req.user.user_id
  if (item.reporter_id !== userId && !isCommunityAdmin(userId, item.community_id)) {
    throw new HttpError(403, 'You can only close your own reports.')
  }
  if (!isStillOpen(item)) {
    throw new HttpError(409, 'Only open reports can be closed.')
  }

  setItemStatus(item, 'CLOSED')
  res.json({ item: toItemView(item) })
}

// GET /api/me/items?type=lost  the logged in user's own reports
export function getMyItems(req, res) {
  const reportType = reportTypeFrom(req.query.type)
  if (!reportType) {
    throw new HttpError(400, 'Add ?type=lost or ?type=found.')
  }
  res.json({ items: listReportsBy(req.user.user_id, reportType) })
}
