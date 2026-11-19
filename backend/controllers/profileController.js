import { findCommunity } from '../models/referenceModel.js'
import { addMembership, findMembership, findUserById, toCurrentUser, updateProfile } from '../models/userModel.js'
import { HttpError } from '../utils/httpError.js'
import { text } from '../utils/validators.js'

// PATCH /api/me  { full_name, phone }  email stays fixed because it's the login
export function updateMe(req, res) {
  const fullName = text(req.body.full_name)
  const phone = text(req.body.phone)

  const fields = {}
  if (fullName.length < 2 || fullName.length > 120) {
    fields.full_name = 'Enter your name.'
  }
  if (phone && !/^[+\d][\d\s-]{6,29}$/.test(phone)) {
    fields.phone = 'Enter a valid phone number, or leave it empty.'
  }
  if (Object.keys(fields).length > 0) {
    throw new HttpError(422, 'Some details need fixing.', fields)
  }

  const user = updateProfile(findUserById(req.user.user_id), { full_name: fullName, phone })
  res.json({ user: toCurrentUser(user) })
}

// POST /api/communities/:id/join  become a member of another community
export function joinCommunity(req, res) {
  const community = findCommunity(req.params.id)
  if (!community) {
    throw new HttpError(404, 'Community not found.')
  }

  const membership = findMembership(req.user.user_id, community.community_id)
  if (membership?.membership_status === 'SUSPENDED') {
    throw new HttpError(403, 'You were suspended from this community. Contact its admin.')
  }
  if (membership) {
    throw new HttpError(409, 'You are already a member.')
  }

  addMembership(req.user.user_id, community.community_id)
  res.status(201).json({ user: toCurrentUser(findUserById(req.user.user_id)) })
}
