import assert from 'node:assert/strict'
import { mkdtempSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import request from 'supertest'

// save test photos in a throwaway folder (set before the app reads its config)
const uploadDir = mkdtempSync(path.join(tmpdir(), 'findr-uploads-'))
process.env.UPLOAD_DIR = uploadDir

const { createApp } = await import('../app.js')
const { loginAs } = await import('./helpers.js')
const app = createApp()

// the first bytes of a real PNG are enough for the check
const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64)])

function reportWithPhotos(auth) {
  return request(app)
    .post('/api/items')
    .set('Authorization', auth)
    .field('report_type', 'LOST')
    .field('title', 'Blue umbrella')
    .field('category_id', 'other')
    .field('community_id', 'northfield-college')
    .field('description', 'Folding umbrella with a wooden handle.')
    .field('event_date', '2026-11-12')
    .field('location_label', 'Library entrance')
}

test('a report can come with photos, and they are served back', async () => {
  const auth = await loginAs(app, 'aarav@northfield.edu')
  const res = await reportWithPhotos(auth).attach('photos', PNG, { filename: 'umbrella.png', contentType: 'image/png' })

  assert.equal(res.status, 201)
  assert.equal(res.body.item.images.length, 1)
  const url = res.body.item.images[0].image_url
  assert.match(url, /^\/uploads\/[0-9a-f-]+\.png$/)

  const photo = await request(app).get(url)
  assert.equal(photo.status, 200)
  assert.equal(photo.headers['content-type'], 'image/png')
  assert.equal(photo.headers['x-content-type-options'], 'nosniff')
})

test('a file pretending to be an image is refused and deleted', async () => {
  const auth = await loginAs(app, 'aarav@northfield.edu')
  const before = readdirSync(uploadDir).length

  const res = await reportWithPhotos(auth).attach('photos', Buffer.from('<script>alert(1)</script>'), {
    filename: 'evil.png',
    contentType: 'image/png',
  })

  assert.equal(res.status, 422)
  assert.equal(readdirSync(uploadDir).length, before)
})

test('other file types and huge files are refused', async () => {
  const auth = await loginAs(app, 'aarav@northfield.edu')

  const pdf = await reportWithPhotos(auth).attach('photos', Buffer.from('%PDF-1.4'), { filename: 'a.pdf', contentType: 'application/pdf' })
  assert.equal(pdf.status, 422)

  const huge = Buffer.concat([PNG, Buffer.alloc(6 * 1024 * 1024)])
  const big = await reportWithPhotos(auth).attach('photos', huge, { filename: 'big.png', contentType: 'image/png' })
  assert.equal(big.status, 413)
})

test('photos of a report that fails validation are not kept', async () => {
  const auth = await loginAs(app, 'aarav@northfield.edu')
  const before = readdirSync(uploadDir).length

  const res = await reportWithPhotos(auth)
    .field('report_type', 'FOUND') // second value makes it an array, so it's invalid
    .attach('photos', PNG, { filename: 'a.png', contentType: 'image/png' })

  assert.equal(res.status, 422)
  assert.equal(readdirSync(uploadDir).length, before)
})

test('guests cannot upload, and only the reporter can add photos later', async () => {
  const guest = await request(app).post('/api/items').attach('photos', PNG, { filename: 'a.png', contentType: 'image/png' })
  assert.equal(guest.status, 401)

  const kabir = await loginAs(app, 'kabir@northfield.edu')
  const notMine = await request(app)
    .post('/api/items/item-backpack-lab/photos')
    .set('Authorization', kabir)
    .attach('photos', PNG, { filename: 'a.png', contentType: 'image/png' })
  assert.equal(notMine.status, 403)

  const aarav = await loginAs(app, 'aarav@northfield.edu')
  const mine = await request(app)
    .post('/api/items/item-backpack-lab/photos')
    .set('Authorization', aarav)
    .attach('photos', PNG, { filename: 'a.png', contentType: 'image/png' })
  assert.equal(mine.status, 201)
  assert.equal(mine.body.item.images.length, 1)
})
