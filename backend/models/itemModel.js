import { randomUUID } from 'node:crypto'
import { db } from './db.js'

// Items come back as the items row + category_name, community_name,
// community_type, reporter_name and images[], like a JOIN would return.
// answer_hash never leaves this file except through findActiveQuestion.

export function toItemView(item) {
  const category = db.categories.find((row) => row.category_id === item.category_id)
  const community = db.communities.find((row) => row.community_id === item.community_id)
  const reporter = db.users.find((row) => row.user_id === item.reporter_id)
  const images = db.item_images
    .filter((image) => image.item_id === item.item_id)
    .map((image) => ({ image_id: image.image_id, image_url: image.image_url }))

  return {
    ...item,
    category_name: category ? category.category_name : 'Other',
    community_name: community ? community.name : '',
    community_type: community ? community.community_type : 'OTHER',
    reporter_name: reporter ? reporter.full_name : 'A Findr member',
    images,
  }
}

export function findItem(itemId) {
  return db.items.find((row) => row.item_id === itemId) || null
}

function hasPin(item) {
  return item.latitude !== null && item.longitude !== null
}

// newest event_date first, then newest report
function newestFirst(itemA, itemB) {
  return itemB.event_date.localeCompare(itemA.event_date) || itemB.created_at.localeCompare(itemA.created_at)
}

function matchesSearch(item, search) {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean)
  const textToSearch = [item.title, item.description, item.location_label, item.category_name, item.community_name]
    .join(' ')
    .toLowerCase()
  return words.every((word) => textToSearch.includes(word))
}

// filters (all optional): search, reportType, categoryId, communityId, status,
// dateFrom, dateTo, location, hasLocation, sort ('newest' | 'oldest'), page, limit.
// Returns one page of items and the total that matched.
export function listItems(filters) {
  let results = db.items.map(toItemView)

  if (filters.search) results = results.filter((item) => matchesSearch(item, filters.search))
  if (filters.reportType) results = results.filter((item) => item.report_type === filters.reportType)
  if (filters.categoryId) results = results.filter((item) => item.category_id === filters.categoryId)
  if (filters.communityId) results = results.filter((item) => item.community_id === filters.communityId)
  if (filters.status) results = results.filter((item) => item.status === filters.status)
  if (filters.dateFrom) results = results.filter((item) => item.event_date >= filters.dateFrom)
  if (filters.dateTo) results = results.filter((item) => item.event_date <= filters.dateTo)
  if (filters.location) {
    const place = filters.location.toLowerCase()
    results = results.filter((item) => item.location_label.toLowerCase().includes(place))
  }
  if (filters.hasLocation) results = results.filter(hasPin)

  results.sort(newestFirst)
  if (filters.sort === 'oldest') {
    results.reverse()
  }

  const start = (filters.page - 1) * filters.limit
  return { items: results.slice(start, start + filters.limit), total: results.length }
}

// Same category, opposite type first (for a lost item the found ones are the likely matches)
export function listSimilarItems(item, limit) {
  return db.items
    .filter((row) => row.item_id !== item.item_id && row.category_id === item.category_id && row.status !== 'CLOSED')
    .map(toItemView)
    .sort((rowA, rowB) => {
      const aIsOpposite = rowA.report_type !== item.report_type ? 0 : 1
      const bIsOpposite = rowB.report_type !== item.report_type ? 0 : 1
      return aIsOpposite - bIsOpposite || newestFirst(rowA, rowB)
    })
    .slice(0, limit)
}

// Found items that could be this lost one: same community and category, still open
export function listPossibleMatches(lostItem, limit) {
  return db.items
    .filter(
      (row) =>
        row.report_type === 'FOUND' &&
        (row.status === 'OPEN' || row.status === 'CLAIM_PENDING') &&
        row.community_id === lostItem.community_id &&
        row.category_id === lostItem.category_id &&
        row.reporter_id !== lostItem.reporter_id,
    )
    .map(toItemView)
    .sort(newestFirst)
    .slice(0, limit)
}

// One user's reports, newest first. FOUND ones get pending_claims and total_claims.
export function listReportsBy(userId, reportType) {
  return db.items
    .filter((item) => item.reporter_id === userId && item.report_type === reportType)
    .sort((itemA, itemB) => itemB.created_at.localeCompare(itemA.created_at))
    .map((item) => {
      const claims = db.claims.filter((claim) => claim.item_id === item.item_id)
      return {
        ...toItemView(item),
        pending_claims: claims.filter((claim) => claim.status === 'PENDING').length,
        total_claims: claims.length,
      }
    })
}

// The item, its photos and (for FOUND) its question go in together
// (one transaction in phase 5)
export function insertItem({ item, imageUrls = [], question = null }) {
  const now = new Date().toISOString()
  const row = { item_id: randomUUID(), ...item, status: 'OPEN', created_at: now, updated_at: now }
  db.items.unshift(row)

  addImages(row.item_id, imageUrls)

  if (question) {
    db.verification_questions.push({
      question_id: randomUUID(),
      item_id: row.item_id,
      question_text: question.question_text,
      answer_hash: question.answer_hash,
      is_active: true,
      created_at: now,
    })
  }

  return row
}

export function addImages(itemId, imageUrls) {
  const now = new Date().toISOString()
  for (const url of imageUrls) {
    db.item_images.push({ image_id: randomUUID(), item_id: itemId, image_url: url, uploaded_at: now })
  }
}

export function updateItem(item, changes) {
  Object.assign(item, changes, { updated_at: new Date().toISOString() })
  return item
}

export function setItemStatus(item, status) {
  item.status = status
  item.updated_at = new Date().toISOString()
}

// The private question of a FOUND item, with its answer hash (for checking claims only)
export function findActiveQuestion(itemId) {
  return db.verification_questions.find((row) => row.item_id === itemId && row.is_active) || null
}
