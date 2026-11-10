import { CURRENT_USER_ID, copy, db, networkDelay } from './mockStore'

// Everyone is the demo user until login (3.1).
// phase 5: GET /api/me
export async function getCurrentUser() {
  await networkDelay(100)

  const user = db.users.find((row) => row.user_id === CURRENT_USER_ID)

  // active memberships only
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
