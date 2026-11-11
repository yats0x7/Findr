import * as seed from './mockData'

// In-memory "database" the services read from. Reports posted from the
// Report form get saved to localStorage so they survive a reload.
// Reset with: localStorage.removeItem('findr-mock-reports-v1')
// Goes away in phase 5 when the services call the API.

const STORAGE_KEY = 'findr-mock-reports-v1'

// only the rows added in this browser get saved
const added = loadAddedRows()

export const db = {
  users: seed.users,
  communities: seed.communities,
  community_memberships: seed.community_memberships,
  categories: seed.categories,
  items: [...added.items, ...seed.items],
  item_images: [...seed.item_images, ...added.item_images],
  verification_questions: [...seed.verification_questions, ...added.verification_questions],
  claims: seed.claims,
  handovers: seed.handovers,
  notifications: seed.notifications,
}

export const CURRENT_USER_ID = seed.CURRENT_USER_ID

function emptyRows() {
  return { items: [], item_images: [], verification_questions: [] }
}

function loadAddedRows() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved && Array.isArray(saved.items) && Array.isArray(saved.item_images) && Array.isArray(saved.verification_questions)) {
      return saved
    }
  } catch {
    // private mode or bad json, just start empty
  }
  return emptyRows()
}

function saveAddedRows() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(added))
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
  added.items.unshift(item)
  added.item_images.push(...images)

  if (question) {
    db.verification_questions.push(question)
    added.verification_questions.push(question)
  }

  if (saveAddedRows()) {
    return true
  }

  // storage full, usually the photos. save without them
  const withoutPhotos = { ...added, item_images: added.item_images.filter((image) => !images.includes(image)) }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutPhotos))
  } catch {
    // no storage at all, it only lasts until reload
  }
  return false
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
