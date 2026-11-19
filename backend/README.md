# Findr backend

The REST API for Findr, built with Node.js and Express.

Data is kept in memory for now (it resets when the server restarts).
Phase 5 moves it to PostgreSQL using the schema in `dbms/03_schema.sql`.

## Run it

You need Node.js 20 or newer.

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API runs on http://localhost:4000/api. Check it with http://localhost:4000/api/health.

- `npm run dev` restarts the server when you save a file
- `npm start` runs it without watching
- `npm test` runs the tests in `tests/`

## Folders

```
backend/
├── server.js        starts the server
├── app.js           builds the Express app (routes, middleware)
├── config/          settings from .env
├── routes/          which URL goes to which controller
├── controllers/     reads the request, calls the models, sends the response
├── models/          reading and writing data (in memory now, SQL in phase 5)
├── services/        the business rules
├── middleware/      code that runs before routes, like error handling
├── utils/           small helpers
└── tests/           API tests (node --test + supertest)
```

## Logging in

`POST /api/auth/login` returns a `token`. Send it on every request that needs an account:

```
Authorization: Bearer <token>
```

Tokens last 7 days (`TOKEN_LIFETIME` in .env). Demo accounts from `data/seed.js` all use the
password `findr123`, e.g. `aarav@northfield.edu` or `rohan@northfield.edu` (admin).

## Photos

Photos are uploaded with Multer and saved in `uploads/` (`UPLOAD_DIR` in .env) under a random name.
Only JPG, PNG and WebP up to 5 MB each, 4 per report. The first bytes of every file are checked
too, so a renamed text file can't get in.

## Claims

A claim only gets created after the answer matches the finder's private question (compared with
bcrypt, the plain answer is never stored). Five wrong answers on one item lock that person out of
it for an hour. Only the finder approves or rejects, and an item can have one approved claim.

## Errors

Every error comes back in the same shape, with a fitting status code:

```json
{ "error": { "message": "Item not found." } }
```

Form errors also have `fields`, like `{ "title": "Use at least 3 characters." }`.

## Endpoints

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/api/health` | Is the API up? |
| POST | `/api/auth/signup` | Create an account `{ full_name, email, password, community_id }` |
| POST | `/api/auth/login` | Log in `{ email, password }`, returns `{ token, user }` |
| GET | `/api/me` | The logged in user and their communities (needs login) |
| GET | `/api/categories` | All item categories |
| GET | `/api/communities` | All communities |
| GET | `/api/items` | Browse items. Query: `search`, `type` (lost/found), `category`, `community`, `status`, `from`, `to`, `location`, `hasLocation=true`, `sort=oldest`, `page`, `limit` (max 50) |
| GET | `/api/items/:id` | One item with its category, community, reporter name and photos |
| GET | `/api/items/:id/similar` | Up to 4 items in the same category |
| GET | `/api/items/:id/matches` | For a lost report: open found items that could be it |
| POST | `/api/items` | Report a lost or found item (needs login). Found items need `question_text` and `answer`. Send as a multipart form to include up to 4 photos in the `photos` field |
| POST | `/api/items/:id/photos` | Add photos to your own report (multipart, `photos` field) |
| GET | `/uploads/<file>` | An uploaded photo |
| GET | `/api/items/:id/claim-status` | Can you claim this item? `{ canClaim, problem }` (works for guests too) |
| GET | `/api/items/:id/claim-form` | The item and the finder's question, if you're allowed to claim |
| POST | `/api/items/:id/claims` | Claim a found item `{ answer }`. A wrong answer creates nothing |
| GET | `/api/me/claims` | Claims you made, with the item and the finder |
| GET | `/api/me/claims-to-review` | Claims on the items you found |
| POST | `/api/claims/:id/withdraw` | Take back your claim while it's still waiting |
| POST | `/api/claims/:id/approve` | Finder approves `{ note? }`. Other waiting claims on that item get rejected |
| POST | `/api/claims/:id/reject` | Finder rejects `{ note? }` |
| PATCH | `/api/items/:id` | Edit your own open report (title, category, description, date, place) |
| POST | `/api/items/:id/close` | Close a report (the reporter or a community admin) |
| GET | `/api/me/items?type=lost` | Your own lost or found reports, with claim counts |
