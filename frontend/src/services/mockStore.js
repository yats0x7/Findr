import * as seed from './mockData'

// In-memory "database" the services read from and write to. The whole thing
// is saved to localStorage after every change, so reports, claims and
// accounts survive a reload. Goes away in phase 5 when the services call the API.

const STORAGE_KEY = 'findr-mock-db-v2'
const SESSION_KEY = 'findr-session-v1'
// phase 2 kept new reports under their own key
const OLD_REPORTS_KEY = 'findr-mock-reports-v1'

const TABLES = [
  'users',
  'communities',
  'community_memberships',
  'categories',
  'items',
  'item_images',
  'verification_questions',
  'claims',
  'handovers',
  'notifications',
]

export const db = loadDb()

function seedTables() {
  const tables = {}
  for (const table of TABLES) {
    tables[table] = structuredClone(seed[table])
  }
  return tables
}

function loadDb() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved && TABLES.every((table) => Array.isArray(saved[table]))) {
      addMissingSeedPhotos(saved)
      return saved
    }
  } catch {
    // private mode or bad json, start from the seed
  }

  const tables = seedTables()
  addPhaseTwoReports(tables)
  return tables
}

// data saved before the sample items had photos still gets them
function addMissingSeedPhotos(tables) {
  const known = new Set(tables.item_images.map((image) => image.image_id))
  const itemIds = new Set(tables.items.map((item) => item.item_id))
  for (const image of seed.item_images) {
    if (!known.has(image.image_id) && itemIds.has(image.item_id)) {
      tables.item_images.push(structuredClone(image))
    }
  }
}

// so reports posted before this version don't disappear
function addPhaseTwoReports(tables) {
  try {
    const old = JSON.parse(localStorage.getItem(OLD_REPORTS_KEY))
    if (old && Array.isArray(old.items)) {
      tables.items.unshift(...old.items)
      tables.item_images.push(...(old.item_images || []))
      tables.verification_questions.push(...(old.verification_questions || []))
      localStorage.removeItem(OLD_REPORTS_KEY)
    }
  } catch {
    // nothing to bring over
  }
}

// Returns false when localStorage is full (big photos) or missing.
// leaveOutImages: photos to skip so everything else still gets saved.
export function saveDb(leaveOutImages = []) {
  const toSave = leaveOutImages.length
    ? { ...db, item_images: db.item_images.filter((image) => !leaveOutImages.includes(image)) }
    : db

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    return true
  } catch {
    return false
  }
}

// Adds the item + its photos + its question together.
// Returns false if the photos didn't fit in localStorage (the report is still saved without them).
export function insertReport({ item, images, question }) {
  db.items.unshift(item)
  db.item_images.push(...images)
  if (question) {
    db.verification_questions.push(question)
  }

  if (saveDb()) {
    return true
  }
  saveDb(images)
  return false
}

// Throws away every change made in this browser (and logs out). Reload the page after.
export function resetDemoData() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // nothing was saved anyway
  }
}

// ---------- Session (who is logged in) ----------

export function getSessionUserId() {
  try {
    const userId = localStorage.getItem(SESSION_KEY)
    return db.users.some((user) => user.user_id === userId) ? userId : null
  } catch {
    return null
  }
}

export function setSessionUserId(userId) {
  try {
    if (userId) {
      localStorage.setItem(SESSION_KEY, userId)
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  } catch {
    // no storage, you'll be logged out on reload
  }
}

// For anything that needs an account. The pages already send guests to
// /login, this is the same check the backend will do.
export function requireUserId() {
  const userId = getSessionUserId()
  if (!userId) {
    throw new Error('Please log in first.')
  }
  return userId
}

// ---------- Helpers ----------

export function addNotification({ userId, itemId = null, claimId = null, type, message }) {
  db.notifications.push({
    notification_id: createId('notification'),
    user_id: userId,
    related_item_id: itemId,
    related_claim_id: claimId,
    notification_type: type,
    message,
    is_read: false,
    created_at: new Date().toISOString(),
  })
}

export function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

// fake network delay so loading states actually show up
export function networkDelay(milliseconds = 200) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

// return copies so pages can't mutate the db by accident
export function copy(value) {
  return structuredClone(value)
}
