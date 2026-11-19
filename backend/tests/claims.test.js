import assert from 'node:assert/strict'
import { test } from 'node:test'
import request from 'supertest'
import { createApp } from '../app.js'
import { db } from '../models/db.js'
import { loginAs } from './helpers.js'

const app = createApp()

// Ananya found the phone (answer: mountains) and the calculator (answer: neha)
const PHONE = '/api/items/item-phone-bus-stop'
const CALCULATOR = '/api/items/item-calculator-exam'

test('guests can see why they cannot claim, logged in users get the question', async () => {
  const guest = await request(app).get(`${PHONE}/claim-status`)
  assert.equal(guest.body.canClaim, false)
  assert.equal(guest.body.problem.code, 'logged-out')

  const aarav = await loginAs(app, 'aarav@northfield.edu')
  const form = await request(app).get(`${PHONE}/claim-form`).set('Authorization', aarav)
  assert.equal(form.body.question_text, 'What is the lock screen wallpaper?')
  assert.ok(!JSON.stringify(form.body).includes('answer_hash'))
})

test('a wrong answer creates no claim', async () => {
  const aarav = await loginAs(app, 'aarav@northfield.edu')
  const before = db.claims.length
  const res = await request(app).post(`${PHONE}/claims`).set('Authorization', aarav).send({ answer: 'beach' })
  assert.equal(res.status, 422)
  assert.equal(db.claims.length, before)
})

test('the right answer creates a pending claim and tells the finder', async () => {
  const aarav = await loginAs(app, 'aarav@northfield.edu')
  const res = await request(app).post(`${PHONE}/claims`).set('Authorization', aarav).send({ answer: '  Mountains ' })
  assert.equal(res.status, 201)
  assert.equal(res.body.claim.status, 'PENDING')
  assert.ok(res.body.claim.verification_passed_at)
  assert.equal(db.items.find((item) => item.item_id === 'item-phone-bus-stop').status, 'CLAIM_PENDING')
  assert.equal(db.notifications.at(-1).user_id, 'user-ananya')
  // the typed answer is not stored anywhere
  assert.ok(!JSON.stringify(db.claims).toLowerCase().includes('mountains'))
})

test('the claim rules are enforced', async () => {
  const aarav = await loginAs(app, 'aarav@northfield.edu')
  const ananya = await loginAs(app, 'ananya@northfield.edu')

  // twice on the same item
  const twice = await request(app).post(`${PHONE}/claims`).set('Authorization', aarav).send({ answer: 'mountains' })
  assert.equal(twice.status, 409)

  // your own found item
  const own = await request(app).post(`${PHONE}/claims`).set('Authorization', ananya).send({ answer: 'mountains' })
  assert.equal(own.status, 409)

  // a lost report
  const lost = await request(app).post('/api/items/item-charger-library/claims').set('Authorization', aarav).send({ answer: 'x' })
  assert.equal(lost.status, 409)

  // a returned item
  const returned = await request(app).post('/api/items/item-id-card-lh3/claims').set('Authorization', aarav).send({ answer: 'kabir' })
  assert.equal(returned.status, 409)

  // a community Aarav isn't in (Lakeside)
  const outsider = await request(app).post('/api/items/item-umbrella-gate/claims').set('Authorization', aarav).send({ answer: 'blue' })
  assert.equal(outsider.status, 403)
})

test('guessing is stopped after 5 wrong answers', async () => {
  const kabir = await loginAs(app, 'kabir@northfield.edu')
  for (let i = 0; i < 5; i++) {
    await request(app).post(`${CALCULATOR}/claims`).set('Authorization', kabir).send({ answer: `guess ${i}` })
  }
  const res = await request(app).post(`${CALCULATOR}/claims`).set('Authorization', kabir).send({ answer: 'neha' })
  assert.equal(res.status, 429)
})

test('only the finder can approve, and approving one rejects the rest', async () => {
  const aarav = await loginAs(app, 'aarav@northfield.edu')
  const rohan = await loginAs(app, 'rohan@northfield.edu')
  const ananya = await loginAs(app, 'ananya@northfield.edu')

  const aaravClaim = (await request(app).post(`${CALCULATOR}/claims`).set('Authorization', aarav).send({ answer: 'neha' })).body.claim
  const rohanClaim = (await request(app).post(`${CALCULATOR}/claims`).set('Authorization', rohan).send({ answer: 'Neha' })).body.claim

  const notFinder = await request(app).post(`/api/claims/${aaravClaim.claim_id}/approve`).set('Authorization', aarav)
  assert.equal(notFinder.status, 403)

  const toReview = await request(app).get('/api/me/claims-to-review').set('Authorization', ananya)
  assert.ok(toReview.body.claims.some((claim) => claim.claim_id === aaravClaim.claim_id))

  const approved = await request(app)
    .post(`/api/claims/${aaravClaim.claim_id}/approve`)
    .set('Authorization', ananya)
    .send({ note: 'Name matches' })
  assert.equal(approved.status, 200)
  assert.equal(approved.body.claim.status, 'APPROVED')

  const other = db.claims.find((claim) => claim.claim_id === rohanClaim.claim_id)
  assert.equal(other.status, 'REJECTED')
  assert.equal(db.items.find((item) => item.item_id === 'item-calculator-exam').status, 'CLAIM_APPROVED')

  // nothing left to decide, and no new claims
  assert.equal((await request(app).post(`/api/claims/${rohanClaim.claim_id}/approve`).set('Authorization', ananya)).status, 409)
  const kabir = await loginAs(app, 'kabir@northfield.edu')
  assert.equal((await request(app).get(`${CALCULATOR}/claim-status`).set('Authorization', kabir)).body.problem.code, 'not-open')
})

test('rejecting the last waiting claim reopens the item', async () => {
  const rohan = await loginAs(app, 'rohan@northfield.edu')
  // seed: Kabir's claim on Rohan's bottle is waiting
  const res = await request(app).post('/api/claims/claim-1/reject').set('Authorization', rohan).send({ note: 'Wrong sticker colour' })
  assert.equal(res.status, 200)
  assert.equal(db.items.find((item) => item.item_id === 'item-bottle-cafeteria').status, 'OPEN')
})

test('a claimant can withdraw a waiting claim, nobody else can', async () => {
  const ananya = await loginAs(app, 'ananya@northfield.edu')
  const kabir = await loginAs(app, 'kabir@northfield.edu')

  // Rohan found the jacket (answer: receipt), Ananya claims it
  const claim = (await request(app).post('/api/items/item-jacket-gym/claims').set('Authorization', ananya).send({ answer: 'receipt' })).body.claim

  assert.equal((await request(app).post(`/api/claims/${claim.claim_id}/withdraw`).set('Authorization', kabir)).status, 404)

  const res = await request(app).post(`/api/claims/${claim.claim_id}/withdraw`).set('Authorization', ananya)
  assert.equal(res.body.claim.status, 'WITHDRAWN')
  assert.equal(db.items.find((item) => item.item_id === 'item-jacket-gym').status, 'OPEN')

  const mine = await request(app).get('/api/me/claims').set('Authorization', ananya)
  assert.ok(mine.body.claims.every((row) => row.claimant_id === 'user-ananya'))
})

test('closing a report closes the claims waiting on it', async () => {
  const kabir = await loginAs(app, 'kabir@northfield.edu')
  const meera = await loginAs(app, 'meera@greenview.in')

  // Meera found the hoodie (answer: rcb), Kabir is in Greenview too
  const claim = (await request(app).post('/api/items/item-hoodie-mess/claims').set('Authorization', kabir).send({ answer: 'rcb' })).body.claim
  await request(app).post('/api/items/item-hoodie-mess/close').set('Authorization', meera)

  assert.equal(db.claims.find((row) => row.claim_id === claim.claim_id).status, 'REJECTED')
})
