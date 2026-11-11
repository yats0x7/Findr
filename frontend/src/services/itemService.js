import { CURRENT_USER_ID, copy, createId, db, insertReport, networkDelay } from './mockStore'
import { sha256 } from '../utils/sha256'

// Item functions. Async so they can become fetch() calls in phase 5
// without changing the pages (API route noted above each one).
//
// Items come back as the items row + category_name, community_name,
// community_type, reporter_name and images[], like a JOIN would return.
// answer_hash is never included.

function toItemView(item) {
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

export function hasMapLocation(item) {
  return item.latitude !== null && item.longitude !== null
}

// newest event_date first, then newest report
function newestFirst(itemA, itemB) {
  return itemB.event_date.localeCompare(itemA.event_date) || itemB.created_at.localeCompare(itemA.created_at)
}

function matchesSearch(item, search) {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean)
  const text = [item.title, item.description, item.location_label, item.category_name, item.community_name]
    .join(' ')
    .toLowerCase()

  return words.every((word) => text.includes(word))
}

// filters (all optional): search, reportType, categoryId, communityId, status,
// dateFrom, dateTo (YYYY-MM-DD, inclusive), location, hasLocation, sort ('newest' | 'oldest'), limit
// phase 5: GET /api/items?...
export async function listItems(filters = {}) {
  await networkDelay()

  let results = db.items.map(toItemView)

  if (filters.search) {
    results = results.filter((item) => matchesSearch(item, filters.search))
  }
  if (filters.reportType) {
    results = results.filter((item) => item.report_type === filters.reportType)
  }
  if (filters.categoryId) {
    results = results.filter((item) => item.category_id === filters.categoryId)
  }
  if (filters.communityId) {
    results = results.filter((item) => item.community_id === filters.communityId)
  }
  if (filters.status) {
    results = results.filter((item) => item.status === filters.status)
  }
  if (filters.dateFrom) {
    results = results.filter((item) => item.event_date >= filters.dateFrom)
  }
  if (filters.dateTo) {
    results = results.filter((item) => item.event_date <= filters.dateTo)
  }
  if (filters.location) {
    const place = filters.location.toLowerCase().trim()
    results = results.filter((item) => item.location_label.toLowerCase().includes(place))
  }
  if (filters.hasLocation) {
    results = results.filter(hasMapLocation)
  }

  results.sort(newestFirst)
  if (filters.sort === 'oldest') {
    results.reverse()
  }

  if (filters.limit) {
    results = results.slice(0, filters.limit)
  }

  return copy(results)
}

// null if it doesn't exist
// phase 5: GET /api/items/:id
export async function getItem(itemId) {
  await networkDelay()

  const item = db.items.find((row) => row.item_id === itemId)
  return item ? copy(toItemView(item)) : null
}

// Same category, opposite type first (for a lost item the found ones are the likely matches)
// phase 5: GET /api/items/:id/similar
export async function listSimilarItems(itemId, limit = 4) {
  await networkDelay()

  const item = db.items.find((row) => row.item_id === itemId)
  if (!item) {
    return []
  }

  const similar = db.items
    .filter((row) => row.item_id !== item.item_id && row.category_id === item.category_id && row.status !== 'CLOSED')
    .map(toItemView)
    .sort((rowA, rowB) => {
      const aIsOpposite = rowA.report_type !== item.report_type ? 0 : 1
      const bIsOpposite = rowB.report_type !== item.report_type ? 0 : 1
      return aIsOpposite - bIsOpposite || newestFirst(rowA, rowB)
    })

  return copy(similar.slice(0, limit))
}

// "  Monstera " and "monstera" should count as the same answer
export function normaliseAnswer(answer) {
  return answer.trim().toLowerCase().replace(/\s+/g, ' ')
}

// Creates a LOST/FOUND report for the current user.
// photos are data urls, question_text + answer only for FOUND.
// Returns { item, photosSaved } (photosSaved is false if they didn't fit in localStorage).
// The form already validates, but the important rules are checked again here like the backend will.
// phase 5: POST /api/items (multipart, photos via multer)
export async function createItem(report) {
  await networkDelay(400)

  const isMember = db.community_memberships.some(
    (row) => row.user_id === CURRENT_USER_ID && row.community_id === report.community_id && row.membership_status === 'ACTIVE',
  )

  if (!['LOST', 'FOUND'].includes(report.report_type)) {
    throw new Error('Choose whether you lost or found the item.')
  }
  if (!report.title?.trim() || !report.description?.trim() || !report.location_label?.trim() || !report.event_date) {
    throw new Error('Fill in every required field.')
  }
  if (!db.categories.some((row) => row.category_id === report.category_id)) {
    throw new Error('Choose a category.')
  }
  if (!isMember) {
    throw new Error('You can only report items in a community you belong to.')
  }
  if (report.report_type === 'FOUND' && (!report.question_text?.trim() || !report.answer?.trim())) {
    throw new Error('Found reports need a private question and its answer.')
  }

  const now = new Date().toISOString()
  const hasPin = typeof report.latitude === 'number' && typeof report.longitude === 'number'

  const item = {
    item_id: createId('item'),
    reporter_id: CURRENT_USER_ID,
    community_id: report.community_id,
    category_id: report.category_id,
    report_type: report.report_type,
    title: report.title.trim(),
    description: report.description.trim(),
    event_date: report.event_date,
    location_label: report.location_label.trim(),
    latitude: hasPin ? report.latitude : null,
    longitude: hasPin ? report.longitude : null,
    status: 'OPEN',
    created_at: now,
    updated_at: now,
  }

  const images = (report.photos || []).map((photoUrl) => ({
    image_id: createId('image'),
    item_id: item.item_id,
    image_url: photoUrl,
    uploaded_at: now,
  }))

  // only FOUND reports get a question, and we only keep the hash
  const question =
    report.report_type === 'FOUND'
      ? {
          question_id: createId('question'),
          item_id: item.item_id,
          question_text: report.question_text.trim(),
          answer_hash: sha256(normaliseAnswer(report.answer)),
          is_active: true,
          created_at: now,
        }
      : null

  const photosSaved = insertReport({ item, images, question })

  return { item: copy(toItemView(item)), photosSaved }
}
