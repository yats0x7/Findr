import { CURRENT_USER_ID, copy, db, networkDelay } from './mockStore'

/*
  The person using the app.

  Until login exists (Stage 3.1), everyone is the demo user from mockData.js.
  Stage 3.1 replaces this with the logged-in user.
  Phase 5: GET /api/me
*/
export async function getCurrentUser() {
  await networkDelay(100)

  const user = db.users.find((row) => row.user_id === CURRENT_USER_ID)

  // The communities this user is an active member of, with their role
  const communities = db.community_memberships
    .filter((row) => row.user_id === CURRENT_USER_ID && row.membership_status === 'ACTIVE')
    .map((membership) => {
      const community = db.communities.find((row) => row.community_id === membership.community_id)
      return { ...community, role: membership.role }
    })

  return copy({
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    communities,
  })
}
