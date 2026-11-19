import { db } from './db.js'
import { toItemView } from './itemModel.js'

// Everything here is limited to the communities the admin manages

// Communities where this user is an active COMMUNITY_ADMIN
export function adminCommunityIds(userId) {
  return db.community_memberships
    .filter((row) => row.user_id === userId && row.role === 'COMMUNITY_ADMIN' && row.membership_status === 'ACTIVE')
    .map((row) => row.community_id)
}

// recovery_rate = found items returned to their owner / all found reports
export function communityOverview(communityId) {
  const community = db.communities.find((row) => row.community_id === communityId)
  const items = db.items.filter((item) => item.community_id === communityId)
  const itemIds = items.map((item) => item.item_id)
  const found = items.filter((item) => item.report_type === 'FOUND')
  const returned = found.filter((item) => item.status === 'RETURNED')

  return {
    ...community,
    members: db.community_memberships.filter((row) => row.community_id === communityId).length,
    lost_reports: items.length - found.length,
    found_reports: found.length,
    open_reports: items.filter((item) => item.status === 'OPEN' || item.status === 'CLAIM_PENDING').length,
    pending_claims: db.claims.filter((claim) => itemIds.includes(claim.item_id) && claim.status === 'PENDING').length,
    returned: returned.length,
    recovery_rate: found.length ? Math.round((returned.length / found.length) * 100) : 0,
  }
}

export function listMembers(communityIds) {
  return db.community_memberships
    .filter((row) => communityIds.includes(row.community_id))
    .map((membership) => {
      const user = db.users.find((row) => row.user_id === membership.user_id)
      const community = db.communities.find((row) => row.community_id === membership.community_id)
      return {
        ...membership,
        full_name: user.full_name,
        email: user.email,
        community_name: community.name,
        reports: db.items.filter((item) => item.reporter_id === user.user_id && item.community_id === community.community_id).length,
      }
    })
    .sort((rowA, rowB) => rowA.full_name.localeCompare(rowB.full_name))
}

export function findMembershipById(membershipId) {
  return db.community_memberships.find((row) => row.membership_id === membershipId) || null
}

export function listCommunityItems(communityIds) {
  return db.items
    .filter((item) => communityIds.includes(item.community_id))
    .sort((itemA, itemB) => itemB.created_at.localeCompare(itemA.created_at))
    .map(toItemView)
}

// rejected_before helps spot people who claim lots of things that aren't theirs
export function listCommunityClaims(communityIds) {
  return db.claims
    .map((claim) => ({ claim, item: db.items.find((row) => row.item_id === claim.item_id) }))
    .filter(({ item }) => communityIds.includes(item.community_id))
    .sort((rowA, rowB) => rowB.claim.created_at.localeCompare(rowA.claim.created_at))
    .map(({ claim, item }) => ({
      ...claim,
      item_title: item.title,
      claimant_name: db.users.find((row) => row.user_id === claim.claimant_id).full_name,
      finder_name: db.users.find((row) => row.user_id === item.reporter_id).full_name,
      rejected_before: db.claims.filter((row) => row.claimant_id === claim.claimant_id && row.status === 'REJECTED').length,
    }))
}
