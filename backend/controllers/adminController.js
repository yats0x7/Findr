import {
  adminCommunityIds,
  communityOverview,
  findMembershipById,
  listCommunityClaims,
  listCommunityItems,
  listMembers,
} from '../models/adminModel.js'
import { HttpError } from '../utils/httpError.js'

// Admins only see the communities they manage. Closing a report uses
// POST /api/items/:id/close, which already lets community admins in.

// GET /api/admin/overview  numbers for each community you manage
export function getOverview(req, res) {
  res.json({ communities: adminCommunityIds(req.user.user_id).map(communityOverview) })
}

// GET /api/admin/members
export function getMembers(req, res) {
  res.json({ members: listMembers(adminCommunityIds(req.user.user_id)) })
}

// PATCH /api/admin/members/:id  { membership_status: 'ACTIVE' | 'SUSPENDED' }
// A suspended member can still log in but can't report or claim in that community.
export function setMemberStatus(req, res) {
  const membership = findMembershipById(req.params.id)
  const status = req.body.membership_status

  if (!membership || !adminCommunityIds(req.user.user_id).includes(membership.community_id)) {
    throw new HttpError(404, 'Member not found in your communities.')
  }
  if (membership.user_id === req.user.user_id) {
    throw new HttpError(409, "You can't suspend yourself.")
  }
  if (membership.role === 'COMMUNITY_ADMIN') {
    throw new HttpError(409, "Admins can't suspend other admins.")
  }
  if (status !== 'ACTIVE' && status !== 'SUSPENDED') {
    throw new HttpError(422, 'membership_status must be ACTIVE or SUSPENDED.')
  }

  membership.membership_status = status
  res.json({ membership })
}

// GET /api/admin/items  every report in your communities
export function getItems(req, res) {
  res.json({ items: listCommunityItems(adminCommunityIds(req.user.user_id)) })
}

// GET /api/admin/claims  every claim in your communities (read only, the finder decides)
export function getClaims(req, res) {
  res.json({ claims: listCommunityClaims(adminCommunityIds(req.user.user_id)) })
}
