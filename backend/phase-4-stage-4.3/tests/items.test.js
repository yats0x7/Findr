import assert from 'node:assert/strict'
import { test } from 'node:test'
import request from 'supertest'
import { createApp } from '../app.js'
import { loginAs } from './helpers.js'

const app = createApp()

const newFoundItem = {
  report_type: 'FOUND',
  title: 'Black Casio watch',
  category_id: 'accessories',
  community_id: 'northfield-college',
  description: 'Digital watch with a cracked strap, found near the vending machine.',
  event_date: '2026-11-10',
  location_label: 'Main Cafeteria',
  question_text: 'What is written on the back?',
  answer: 'Happy Birthday',
}

test('anyone can browse items, with filters and pages', async () => {
  const all = await request(app).get('/api/items')
  assert.equal(all.status, 200)
  assert.equal(all.body.total, 20)

  const found = await request(app).get('/api/items?type=found&category=water-bottles')
  assert.ok(found.body.items.every((item) => item.report_type === 'FOUND' && item.category_id === 'water-bottles'))

  const search = await request(app).get('/api/items?search=bottle cafeteria')
  assert.deepEqual(search.body.items.map((item) => item.item_id), ['item-bottle-cafeteria'])

  const page2 = await request(app).get('/api/items?limit=5&page=2')
  assert.equal(page2.body.items.length, 5)
  assert.equal(page2.body.page, 2)
})

test('items come with names and photos, never the answer hash', async () => {
  const res = await request(app).get('/api/items/item-bottle-cafeteria')
  assert.equal(res.status, 200)
  assert.equal(res.body.item.category_name, 'Water Bottles')
  assert.equal(res.body.item.reporter_name, 'Rohan Verma')
  assert.deepEqual(res.body.item.images, [])
  assert.ok(!JSON.stringify(res.body).includes('answer_hash'))

  const list = await request(app).get('/api/items?limit=50')
  assert.ok(!JSON.stringify(list.body).includes('answer_hash'))
})

test('a missing item is a 404', async () => {
  assert.equal((await request(app).get('/api/items/nope')).status, 404)
})

test('similar items and possible matches', async () => {
  const similar = await request(app).get('/api/items/item-charger-library/similar')
  assert.equal(similar.status, 200)
  assert.equal(similar.body.items[0].report_type, 'FOUND')

  const matches = await request(app).get('/api/items/item-charger-library/matches')
  assert.ok(matches.body.items.every((item) => item.report_type === 'FOUND' && item.community_id === 'northfield-college'))
})

test('reporting needs a login', async () => {
  const res = await request(app).post('/api/items').send(newFoundItem)
  assert.equal(res.status, 401)
})

test('a found report is created and its answer is only stored hashed', async () => {
  const auth = await loginAs(app, 'aarav@northfield.edu')
  const res = await request(app).post('/api/items').set('Authorization', auth).send(newFoundItem)
  assert.equal(res.status, 201)
  assert.equal(res.body.item.status, 'OPEN')
  assert.equal(res.body.item.reporter_name, 'Aarav Kapoor')
  assert.ok(!JSON.stringify(res.body).includes('Happy Birthday'))

  const { db } = await import('../models/db.js')
  const question = db.verification_questions.find((row) => row.item_id === res.body.item.item_id)
  assert.match(question.answer_hash, /^\$2[ab]\$/)
})

test('bad reports get field errors', async () => {
  const auth = await loginAs(app, 'aarav@northfield.edu')
  const res = await request(app)
    .post('/api/items')
    .set('Authorization', auth)
    .send({ ...newFoundItem, title: 'x', event_date: '2999-01-01', answer: '', latitude: 200, longitude: 10 })
  assert.equal(res.status, 422)
  assert.deepEqual(Object.keys(res.body.error.fields).sort(), ['answer', 'event_date', 'latitude', 'title'])
})

test("you can't report in a community you don't belong to", async () => {
  const auth = await loginAs(app, 'aarav@northfield.edu')
  const res = await request(app)
    .post('/api/items')
    .set('Authorization', auth)
    .send({ ...newFoundItem, community_id: 'lakeside-residency' })
  assert.equal(res.status, 422)
  assert.ok(res.body.error.fields.community_id)
})

test('only the reporter can edit, and only while open', async () => {
  const aarav = await loginAs(app, 'aarav@northfield.edu')
  const kabir = await loginAs(app, 'kabir@northfield.edu')
  const changes = { ...newFoundItem, title: 'Grey Wildcraft backpack with stickers', category_id: 'bags' }

  const notMine = await request(app).patch('/api/items/item-backpack-lab').set('Authorization', kabir).send(changes)
  assert.equal(notMine.status, 403)

  const mine = await request(app).patch('/api/items/item-backpack-lab').set('Authorization', aarav).send(changes)
  assert.equal(mine.status, 200)
  assert.equal(mine.body.item.title, 'Grey Wildcraft backpack with stickers')

  // Ananya's ID card was already returned
  const ananya = await loginAs(app, 'ananya@northfield.edu')
  const finished = await request(app).patch('/api/items/item-id-card-lh3').set('Authorization', ananya).send(changes)
  assert.equal(finished.status, 409)
})

test('the reporter or a community admin can close a report', async () => {
  const kabir = await loginAs(app, 'kabir@northfield.edu')
  const rohan = await loginAs(app, 'rohan@northfield.edu')

  // Ananya's charger: Kabir can't, Rohan (Northfield admin) can
  assert.equal((await request(app).post('/api/items/item-charger-library/close').set('Authorization', kabir)).status, 403)
  const closed = await request(app).post('/api/items/item-charger-library/close').set('Authorization', rohan)
  assert.equal(closed.status, 200)
  assert.equal(closed.body.item.status, 'CLOSED')

  const again = await request(app).post('/api/items/item-charger-library/close').set('Authorization', rohan)
  assert.equal(again.status, 409)
})

test('/api/me/items lists your own reports with claim counts', async () => {
  const auth = await loginAs(app, 'aarav@northfield.edu')
  const lost = await request(app).get('/api/me/items?type=lost').set('Authorization', auth)
  assert.equal(lost.status, 200)
  assert.ok(lost.body.items.length >= 2)
  assert.ok(lost.body.items.every((item) => item.reporter_id === 'user-aarav' && item.report_type === 'LOST'))
  assert.equal(typeof lost.body.items[0].pending_claims, 'number')
})
