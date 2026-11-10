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

**Phase 2: Core frontend pages** (in progress)

| Stage | What it adds |
| --- | --- |
| 2.1 Mock data layer | The 10 database tables as sample data in `src/services/`, with the same column names as `dbms/03_schema.sql`. Pages get data only through the service functions |
| 2.2 Explore | Search, filters (type, category, community, status, place, dates) and sorting at `/explore`. Filters live in the URL, so a filtered list can be shared |
| 2.3 Item details | Photos, status, place, reporter and similar items at `/items/:id`. Claim button on found items only. The private answer is never shown |

Next: 2.4 Report form and 2.5 Map.

Pages not built yet (Report, Map, and Phase 3: login, dashboard, claims and the rest) show a placeholder saying which stage builds them.

### Sample data while there is no backend

- Everyone posts as the demo user **Aarav Kapoor** until login arrives in Stage 3.1.
- Reports you post (once the Report form lands in Stage 2.4) are saved in your browser, so they survive a reload. To start fresh, run `localStorage.removeItem('findr-mock-reports-v1')` in the browser console.
- The answers to the sample private questions are listed at the top of `src/services/mockData.js`, for testing claims in Stage 3.3.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173.

Other commands:

- `npm run build` creates the production version in `frontend/dist`
- `npm run lint` checks the code for mistakes

## How the frontend is organised

```
frontend/
├── index.html            the single HTML page React runs inside
├── public/               files served as they are (favicon)
└── src/
    ├── main.jsx          starting point: sets up React and the router
    ├── App.jsx           list of every page and its address
    ├── layouts/          the frame around pages (navbar + footer)
    ├── components/       reusable pieces: Button, Badge, ItemCard, Navbar...
    ├── pages/            one file per page
    ├── services/         every data call (sample data now, the real API in Phase 5)
    ├── hooks/            useAsync (loading data) and useItemFilters (filters in the URL)
    ├── utils/            small helpers: dates, labels, hashing
    └── styles/
        ├── tokens.css    every colour, size and spacing value
        ├── base.css      defaults for plain HTML elements
        ├── layout.css    page width, navbar, footer
        ├── components.css buttons, badges, cards, inputs
        └── pages/        styles used by only one page
```

## Tech stack

React, Vite, JavaScript, React Router and plain CSS (no Tailwind).
Planned for later phases: Node.js, Express, Multer, PostgreSQL, Leaflet.
