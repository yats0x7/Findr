import assert from 'node:assert/strict'
import { test } from 'node:test'
import request from 'supertest'
import { createApp } from '../app.js'
import { loginAs } from './helpers.js'

const app = createApp()

test('admin routes are closed to guests and plain members', async () => {
  assert.equal((await request(app).get('/api/admin/overview')).status, 401)

  const aarav = await loginAs(app, 'aarav@northfield.edu')
  assert.equal((await request(app).get('/api/admin/overview').set('Authorization', aarav)).status, 403)
})

test('an admin only sees their own communities', async () => {
  const rohan = await loginAs(app, 'rohan@northfield.edu')

  const overview = await request(app).get('/api/admin/overview').set('Authorization', rohan)
  assert.deepEqual(overview.body.communities.map((row) => row.community_id), ['northfield-college'])
  assert.equal(typeof overview.body.communities[0].recovery_rate, 'number')

  const items = await request(app).get('/api/admin/items').set('Authorization', rohan)
  assert.ok(items.body.items.every((item) => item.community_id === 'northfield-college'))

  const claims = await request(app).get('/api/admin/claims').set('Authorization', rohan)
  assert.ok(claims.body.claims.length > 0)
  assert.ok(claims.body.claims.every((claim) => typeof claim.rejected_before === 'number'))
})

test('suspending a member stops them reporting there', async () => {
  const rohan = await loginAs(app, 'rohan@northfield.edu')
  const members = (await request(app).get('/api/admin/members').set('Authorization', rohan)).body.members
  const kabir = members.find((row) => row.user_id === 'user-kabir')
  const self = members.find((row) => row.user_id === 'user-rohan')

  assert.equal((await request(app).patch(`/api/admin/members/${self.membership_id}`).set('Authorization', rohan).send({ membership_status: 'SUSPENDED' })).status, 409)

  const res = await request(app)
    .patch(`/api/admin/members/${kabir.membership_id}`)
    .set('Authorization', rohan)
    .send({ membership_status: 'SUSPENDED' })
  assert.equal(res.body.membership.membership_status, 'SUSPENDED')

  const kabirAuth = await loginAs(app, 'kabir@northfield.edu')
  const report = await request(app).post('/api/items').set('Authorization', kabirAuth).send({
    report_type: 'LOST',
    title: 'Red pencil box',
    category_id: 'other',
    community_id: 'northfield-college',
    description: 'Red metal pencil box with my name inside.',
    event_date: '2026-11-12',
    location_label: 'LH-3',
  })
  assert.equal(report.status, 422)
  assert.ok(report.body.error.fields.community_id)
})

test("an admin can't manage members of someone else's community", async () => {
  const meera = await loginAs(app, 'meera@greenview.in') // Greenview admin
  const rohan = await loginAs(app, 'rohan@northfield.edu')
  const northfieldMember = (await request(app).get('/api/admin/members').set('Authorization', rohan)).body.members.find(
    (row) => row.community_id === 'northfield-college' && row.role === 'MEMBER',
  )

  const res = await request(app)
    .patch(`/api/admin/members/${northfieldMember.membership_id}`)
    .set('Authorization', meera)
    .send({ membership_status: 'SUSPENDED' })
  assert.equal(res.status, 404)
})
