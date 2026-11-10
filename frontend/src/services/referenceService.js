import { copy, db, networkDelay } from './mockStore'

/*
  Categories and communities: the fixed lists that filters and forms choose from.
  Phase 5: GET /api/categories and GET /api/communities
*/

export async function listCategories() {
  await networkDelay(100)
  return copy(db.categories)
}

export async function listCommunities() {
  await networkDelay(100)
  return copy(db.communities)
}
