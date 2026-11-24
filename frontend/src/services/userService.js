import { copy, createId, db, getSessionUserId, networkDelay, requireUserId, saveDb } from './mockStore'

// demo only, used by the Profile page. No backend version of this.
export { resetDemoData } from './mockStore'

// The logged in user, or null for guests.
// communities = the ones they're an active member of, with their role there.
// phase 5: GET /api/me
export async function getCurrentUser() {
  await networkDelay(100)

  const userId = getSessionUserId()
  const user = db.users.find((row) => row.user_id === userId)
  if (!user) {
    return null
  }

  const communities = db.community_memberships
    .filter((row) => row.user_id === userId && row.membership_status === 'ACTIVE')
    .map((membership) => {
      const community = db.communities.find((row) => row.community_id === membership.community_id)
      return { ...community, role: membership.role }
    })

  return copy({
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    created_at: user.created_at,
    communities,
    isAdmin: communities.some((community) => community.role === 'COMMUNITY_ADMIN'),
  })
}

// Name and phone. Email stays fixed because it's the login.
// phase 5: PATCH /api/me
export async function updateProfile({ full_name, phone }) {
  await networkDelay(300)

  const user = db.users.find((row) => row.user_id === requireUserId())
  const name = full_name.trim()
  const cleanPhone = phone.trim()

  if (name.length < 2) {
    throw new Error('Enter your name.')
  }
  if (cleanPhone && !/^[+\d][\d\s-]{6,19}$/.test(cleanPhone)) {
    throw new Error('Enter a valid phone number, or leave it empty.')
  }

  user.full_name = name
  user.phone = cleanPhone || null
  saveDb()
}

// Join another college, hostel or colony as a member
// phase 5: POST /api/communities/:id/join
export async function joinCommunity(communityId) {
  await networkDelay(300)

  const userId = requireUserId()
  if (!db.communities.some((row) => row.community_id === communityId)) {
    throw new Error('That community does not exist.')
  }

  const membership = db.community_memberships.find((row) => row.user_id === userId && row.community_id === communityId)
  if (membership?.membership_status === 'SUSPENDED') {
    throw new Error('You were suspended from this community. Contact its admin.')
  }
  if (membership) {
    throw new Error('You are already a member.')
  }

  db.community_memberships.push({
    membership_id: createId('membership'),
    community_id: communityId,
    user_id: userId,
    role: 'MEMBER',
    membership_status: 'ACTIVE',
    joined_at: new Date().toISOString(),
  })
  saveDb()
}
