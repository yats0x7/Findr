# Findr

A lost and found platform for colleges, hostels and residential communities.
People report what they lost or found, prove ownership with a private question,
and the item's whole journey is tracked until it is returned.

## Where we are

**Phase 1: Frontend foundation** (done)

| Stage | What it adds |
| --- | --- |
| 1.1 Project setup | React + Vite app in `frontend/` |
| 1.2 Design system | Colours, type, spacing, buttons, badges, cards, inputs. See them all at `/style-guide` |
| 1.3 Routing and layout | Every page has its address, plus the navbar, footer and a 404 page |
| 1.4 Home page | Hero with search, recent items, how Findr works, communities |

**Phase 2: Core frontend pages** (done)

| Stage | What it adds |
| --- | --- |
| 2.1 Mock data | Sample rows for all 10 tables in `src/services/`, same columns as `dbms/03_schema.sql` |
| 2.2 Explore | `/explore` with search, filters and sort. Filters are kept in the URL |
| 2.3 Item details | `/items/:id` with photos, info, a small map and similar items. Claim button only on found items |
| 2.4 Report form | `/report` for lost and found reports, with photos, an optional map pin and the private question |
| 2.5 Map | `/map` with every pinned report (red = lost, green = found), same filters as Explore |

**Phase 3: User workflows** (done)

| Stage | What it adds |
| --- | --- |
| 3.1 Login and signup | `/login`, `/signup`, and guests get sent to login before reporting or claiming |
| 3.2 Dashboard | `/dashboard` overview, my lost reports (edit, close, possible matches), my found reports (claim counts) |
| 3.3 Claims | `/items/:id/claim` checks the answer before a claim exists. `/dashboard/claims` to follow or withdraw them |
| 3.4 Verification | `/dashboard/verification` where the finder approves or rejects. Approving one closes the rest |
| 3.5 Handover and notifications | Pick a time and place, the finder marks it returned. `/dashboard/notifications` and the bell in the navbar |
| 3.6 Profile, help, admin | `/profile`, `/help` (FAQ, safety, contact form) and `/admin` for community admins: members, reports, claims |

**Phase 4: Backend** (done, see [backend/README.md](backend/README.md))

| Stage | What it adds |
| --- | --- |
| 4.1 Express setup | `backend/` with Express, CORS, one error format and `GET /api/health` |
| 4.2 Authentication | Signup and login with bcrypt passwords and JWT tokens, plus login and admin middleware |
| 4.3 Items API | Browse with filters and pages, one item, similar items, report, edit and close |
| 4.4 Image uploads | Photos with Multer: JPG, PNG or WebP, 5 MB each, 4 per report, checked to be real images |
| 4.5 Claims API | Answer check before a claim exists, finder-only approve and reject, withdraw, limits on guessing |
| 4.6 Handover, notifications, admin | Set, change, cancel and complete handovers, notifications, profile edits and the admin endpoints |

The backend has 50 tests (`cd backend && npm test`). Phase 5 moves its data to PostgreSQL and
connects the frontend to it.

### Mock data notes

- Demo accounts all use the password `findr123`. Good ones to try:
  `aarav@northfield.edu` (student), `ananya@northfield.edu` (finder with claims to review),
  `rohan@northfield.edu` (admin of Northfield).
- Profile has a "Reset demo data" button to start over.
- Everything you do (reports, claims, new accounts) is saved in localStorage.
  Reset with `localStorage.removeItem('findr-mock-db-v2')`.
- Answers to the sample private questions are at the top of `src/services/mockData.js`.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

The frontend still runs on its own sample data. The backend is separate for now
(how to run it is in [backend/README.md](backend/README.md)), and Phase 5 connects the two.

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173.

Other commands:

- `npm run build` creates the production version in `frontend/dist`
- `npm run lint` checks the code for mistakes

## Deploying

Until Phase 5 the two parts are deployed separately and don't talk to each other yet.

Frontend (a static site, e.g. Vercel or Netlify):

- root directory `frontend`, build command `npm run build`, output folder `dist`
- `frontend/vercel.json` and `frontend/public/_redirects` send every path to `index.html`,
  so links like `/dashboard` still work after a refresh

Backend (a Node server, e.g. Render or Railway):

- root directory `backend`, start command `npm start`
- set `NODE_ENV=production`, a random `JWT_SECRET` of 32+ characters
  (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
  and `CORS_ORIGIN` to the frontend's address. The server won't start with a missing or weak secret.
- data is kept in memory and uploaded photos on the server's disk, so both reset when it
  restarts. Phase 5 moves the data to PostgreSQL.

The demo accounts and their shared password are public, so treat a deploy as a demo, not for real users.

## How the frontend is organised

```
frontend/
├── index.html            the single HTML page React runs inside
├── public/               files served as they are (favicon)
└── src/
    ├── main.jsx          starting point: sets up React and the router
    ├── App.jsx           list of every page and its address
    ├── layouts/          the frame around pages (navbar + footer, dashboard side menu)
    ├── routes/           RequireLogin (guests go to /login) and RequireAdmin
    ├── context/          AuthProvider, keeps the logged in user for every page
    ├── components/       reusable pieces: Button, Badge, ItemCard, ItemRow, Navbar...
    ├── pages/            one file per page (pages/dashboard and pages/admin for those areas)
    ├── services/         every data call (sample data now, the real API in Phase 5)
    │                     rules.js has the claim rules in one place
    ├── hooks/            useAsync (loading data), useItemFilters (filters in the URL), useAuth
    ├── utils/            small helpers: dates, labels, hashing, photos, map settings
    └── styles/
        ├── tokens.css    every colour, size and spacing value
        ├── base.css      defaults for plain HTML elements
        ├── layout.css    page width, navbar, footer
        ├── components.css buttons, badges, cards, inputs
        └── pages/        styles used by only one page
```

## Tech stack

Frontend: React, Vite, JavaScript, React Router, plain CSS (no Tailwind) and Leaflet with OpenStreetMap.
Backend: Node.js, Express, bcrypt, JWT and Multer.
Planned for phase 5: PostgreSQL.
