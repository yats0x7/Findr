import * as seed from './mockData'

/*
  The in-memory copy of the mock database that the services read and write.

  Seed rows come from mockData.js. Reports you post through the Report form
  are added on top and saved in the browser (localStorage), so they survive
  a page reload. To start fresh, run this in the browser console:

    localStorage.removeItem('findr-mock-reports-v1')

  Phase 5 deletes this file: the services will call the Express API instead.
*/

const STORAGE_KEY = 'findr-mock-reports-v1'

// The reports this browser has added, kept separately so only they get saved
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
    // Private browsing or broken JSON: start with nothing saved
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

/*
  Adds a new report (the item, its photos and its private question) in one go,
  like the database transaction the backend will run.

  Returns false if the photos were too big to save in the browser. The report
  is still saved, and its photos stay visible until the page is reloaded.
*/
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

  // Browser storage is full (usually because of photos): save the report without them
  const withoutPhotos = { ...added, item_images: added.item_images.filter((image) => !images.includes(image)) }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutPhotos))
  } catch {
    // Storage is unavailable entirely; the report lives until the page reloads
  }
  return false
}

// A new readable ID, e.g. "item-m3k9x2-4f7a"
export function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

// Pretend the data came over the network, so pages show their loading states now
export function networkDelay(milliseconds = 200) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

// Services return copies, so a page can never change the "database" by accident
export function copy(value) {
  return structuredClone(value)
}
