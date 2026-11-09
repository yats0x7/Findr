# Findr

A lost and found platform for colleges, hostels and residential communities.
People report what they lost or found, prove ownership with a private question,
and the item's whole journey is tracked until it is returned.

## Where we are

**Phase 1: Frontend foundation** (this branch)

| Stage | What it adds |
| --- | --- |
| 1.1 Project setup | React + Vite app in `frontend/` |
| 1.2 Design system | Colours, type, spacing, buttons, badges, cards, inputs. See them all at `/style-guide` |
| 1.3 Routing and layout | Every page has its address, plus the navbar, footer and a 404 page |
| 1.4 Home page | Hero with search, recent items, how Findr works, communities |

Every other page shows a placeholder saying which stage builds it.

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
    ├── data/             sample data for now (real API later)
    ├── utils/            small helpers like date formatting
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
