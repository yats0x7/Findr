import { randomUUID } from 'node:crypto'
import { db } from './db.js'
import { findCommunity } from './referenceModel.js'

export function findUserById(userId) {
  return db.users.find((row) => row.user_id === userId) || null
}

export function findUserByEmail(email) {
  const wanted = email.trim().toLowerCase()
  return db.users.find((row) => row.email.toLowerCase() === wanted) || null
}

// A new user and their first membership go in together (one transaction in phase 5)
export function createUser({ full_name, email, password_hash, community_id }) {
  const now = new Date().toISOString()
  const user = {
    user_id: randomUUID(),
    full_name,
    email,
    password_hash,
    phone: null,
    profile_image_url: null,
    created_at: now,
  }

  db.users.push(user)
  db.community_memberships.push({
    membership_id: randomUUID(),
    community_id,
    user_id: user.user_id,
    role: 'MEMBER',
    membership_status: 'ACTIVE',
    joined_at: now,
  })

  return user
}

// Communities the user is an active member of, with their role in each
export function listActiveCommunities(userId) {
  return db.community_memberships
    .filter((row) => row.user_id === userId && row.membership_status === 'ACTIVE')
    .map((membership) => ({ ...findCommunity(membership.community_id), role: membership.role }))
}

// What the API sends about the logged in user. Never the password hash.
export function toCurrentUser(user) {
  const communities = listActiveCommunities(user.user_id)
  return {
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    created_at: user.created_at,
    communities,
    isAdmin: communities.some((community) => community.role === 'COMMUNITY_ADMIN'),
  }
}

export function updateProfile(user, { full_name, phone }) {
  user.full_name = full_name
  user.phone = phone || null
  return user
}

export function findMembership(userId, communityId) {
  return db.community_memberships.find((row) => row.user_id === userId && row.community_id === communityId) || null
}

export function addMembership(userId, communityId) {
  db.community_memberships.push({
    membership_id: randomUUID(),
    community_id: communityId,
    user_id: userId,
    role: 'MEMBER',
    membership_status: 'ACTIVE',
    joined_at: new Date().toISOString(),
  })
}
