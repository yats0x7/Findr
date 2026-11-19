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
| POST | `/api/items` | Report a lost or found item (needs login). Found items need `question_text` and `answer` |
| PATCH | `/api/items/:id` | Edit your own open report (title, category, description, date, place) |
| POST | `/api/items/:id/close` | Close a report (the reporter or a community admin) |
| GET | `/api/me/items?type=lost` | Your own lost or found reports, with claim counts |
