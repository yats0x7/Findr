import assert from 'node:assert/strict'
import { test } from 'node:test'
import request from 'supertest'
import { createApp } from '../app.js'
import { db } from '../models/db.js'
import { loginAs } from './helpers.js'

const app = createApp()

// seed: Kabir found the earbuds and approved Ananya's claim (claim-2), handover already set
const CLAIM = '/api/claims/claim-2'
const tomorrow = () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

test('only the two people involved can see or change the handover', async () => {
  const rohan = await loginAs(app, 'rohan@northfield.edu')
  const res = await request(app).put(`${CLAIM}/handover`).set('Authorization', rohan).send({ scheduled_at: tomorrow(), handover_location: 'Gate 1' })
  assert.equal(res.status, 404)
})

test('the handover needs a future time and a place', async () => {
  const ananya = await loginAs(app, 'ananya@northfield.edu')
  const res = await request(app)
    .put(`${CLAIM}/handover`)
    .set('Authorization', ananya)
    .send({ scheduled_at: '2020-01-01T10:00:00Z', handover_location: '' })
  assert.equal(res.status, 422)
  assert.deepEqual(Object.keys(res.body.error.fields).sort(), ['handover_location', 'scheduled_at'])
})

test('either side can move the handover, and the other side hears about it', async () => {
  const ananya = await loginAs(app, 'ananya@northfield.edu')
  const res = await request(app)
    .put(`${CLAIM}/handover`)
    .set('Authorization', ananya)
    .send({ scheduled_at: tomorrow(), handover_location: 'Library front desk' })

  assert.equal(res.status, 200)
  assert.equal(res.body.claim.handover.handover_location, 'Library front desk')
  assert.equal(db.notifications.at(-1).user_id, 'user-kabir')
})

test('only the finder can mark it returned, then the item is done', async () => {
  const ananya = await loginAs(app, 'ananya@northfield.edu')
  const kabir = await loginAs(app, 'kabir@northfield.edu')

  assert.equal((await request(app).post(`${CLAIM}/handover/complete`).set('Authorization', ananya)).status, 403)

  const res = await request(app).post(`${CLAIM}/handover/complete`).set('Authorization', kabir).send({ note: 'In person' })
  assert.equal(res.status, 200)
  assert.equal(res.body.claim.handover.status, 'COMPLETED')
  assert.ok(res.body.claim.handover.completed_at)
  assert.equal(res.body.claim.item.status, 'RETURNED')

  const status = await request(app).get('/api/items/item-earbuds-sports/claim-status').set('Authorization', ananya)
  assert.equal(status.body.problem.code, 'not-open')
})

test('a claim that is not approved has no handover', async () => {
  const rohan = await loginAs(app, 'rohan@northfield.edu')
  // claim-1 (Kabir on Rohan's bottle) is still waiting
  const res = await request(app).put('/api/claims/claim-1/handover').set('Authorization', rohan).send({ scheduled_at: tomorrow(), handover_location: 'Gate 1' })
  assert.equal(res.status, 409)
})

test('a cancelled handover can be set again', async () => {
  const rohan = await loginAs(app, 'rohan@northfield.edu')
  const kabir = await loginAs(app, 'kabir@northfield.edu')
  await request(app).post('/api/claims/claim-1/approve').set('Authorization', rohan)

  await request(app).put('/api/claims/claim-1/handover').set('Authorization', kabir).send({ scheduled_at: tomorrow(), handover_location: 'Cafeteria' })
  const cancelled = await request(app).post('/api/claims/claim-1/handover/cancel').set('Authorization', rohan)
  assert.equal(cancelled.body.claim.handover.status, 'CANCELLED')

  const again = await request(app).put('/api/claims/claim-1/handover').set('Authorization', rohan).send({ scheduled_at: tomorrow(), handover_location: 'Gate 1' })
  assert.equal(again.body.claim.handover.status, 'SCHEDULED')
})

test('notifications: list, unread count and marking as read', async () => {
  const ananya = await loginAs(app, 'ananya@northfield.edu')

  const list = await request(app).get('/api/me/notifications').set('Authorization', ananya)
  assert.ok(list.body.notifications.every((row) => row.user_id === 'user-ananya' && row.link))

  const unread = (await request(app).get('/api/me/notifications/unread-count').set('Authorization', ananya)).body.unread
  assert.ok(unread > 0)

  const first = list.body.notifications.find((row) => !row.is_read)
  assert.equal((await request(app).post(`/api/notifications/${first.notification_id}/read`).set('Authorization', ananya)).status, 204)

  // someone else's notification
  const kabir = await loginAs(app, 'kabir@northfield.edu')
  assert.equal((await request(app).post(`/api/notifications/${first.notification_id}/read`).set('Authorization', kabir)).status, 404)

  await request(app).post('/api/me/notifications/read-all').set('Authorization', ananya)
  assert.equal((await request(app).get('/api/me/notifications/unread-count').set('Authorization', ananya)).body.unread, 0)
})

test('profile: change your name and phone, join another community', async () => {
  const aarav = await loginAs(app, 'aarav@northfield.edu')

  const bad = await request(app).patch('/api/me').set('Authorization', aarav).send({ full_name: 'A', phone: 'call me' })
  assert.equal(bad.status, 422)

  const ok = await request(app).patch('/api/me').set('Authorization', aarav).send({ full_name: 'Aarav K', phone: '+91 98100 12345' })
  assert.equal(ok.body.user.full_name, 'Aarav K')

  const joined = await request(app).post('/api/communities/lakeside-residency/join').set('Authorization', aarav)
  assert.equal(joined.status, 201)
  assert.ok(joined.body.user.communities.some((row) => row.community_id === 'lakeside-residency'))

  const again = await request(app).post('/api/communities/lakeside-residency/join').set('Authorization', aarav)
  assert.equal(again.status, 409)
})
