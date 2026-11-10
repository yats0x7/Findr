import { CURRENT_USER_ID, copy, createId, db, insertReport, networkDelay } from './mockStore'
import { sha256 } from '../utils/sha256'

/*
  Items: lost and found reports.

  Every page gets item data from these functions and nowhere else. They are
  async on purpose: in Phase 5 each one becomes a fetch() to the Express API
  (noted above each function) and the pages keep working unchanged.

  An item as pages receive it is the items row plus a few joined fields,
  the way a SQL JOIN returns it:
    category_name, community_name, community_type, reporter_name, images[]

  The verification question's answer_hash is never joined in.
  No function here returns it.
*/

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

// Newest event first; for the same day, the most recent report first
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

/*
  List items, filtered and sorted.

  filters (all optional):
    search        words to look for in the title, description, location, category and community
    reportType    'LOST' or 'FOUND'
    categoryId, communityId
    status        'OPEN', 'CLAIM_PENDING', 'CLAIM_APPROVED', 'RETURNED' or 'CLOSED'
    dateFrom, dateTo   'YYYY-MM-DD', compared with event_date (both ends included)
    location      words to look for in location_label
    hasLocation   true = only items pinned on the map
    sort          'newest' (default) or 'oldest'
    limit         at most this many items

  Phase 5: GET /api/items?search=...&type=...&category=...
*/
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

/*
  One item, or null if there is no item with that ID.
  Phase 5: GET /api/items/:id (404 becomes null)
*/
export async function getItem(itemId) {
  await networkDelay()

  const item = db.items.find((row) => row.item_id === itemId)
  return item ? copy(toItemView(item)) : null
}

/*
  Items in the same category, for the "Similar items" section.
  Reports of the opposite type come first: for a lost item, found items
  in the same category are the most likely matches.
  Phase 5: GET /api/items/:id/similar
*/
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

/*
  Answers are compared in lowercase with extra spaces removed, so
  "  Monstera " and "monstera" count as the same answer.
*/
export function normaliseAnswer(answer) {
  return answer.trim().toLowerCase().replace(/\s+/g, ' ')
}

/*
  Post a new LOST or FOUND report as the current user.

  report: {
    report_type, title, description, category_id, community_id,
    event_date, location_label, latitude, longitude,
    photos: [image data URLs],
    question_text, answer   (FOUND reports only)
  }

  Returns { item, photosSaved }. photosSaved is false when the photos were
  too large to keep in browser storage.

  The form checks everything first. These checks repeat the important
  rules, the way the backend will, because anything checked only in the
  browser can be bypassed.

  Phase 5: POST /api/items (multipart form data, photos through Multer)
*/
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

  // Only FOUND reports get a question. The answer is hashed and then thrown away.
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
