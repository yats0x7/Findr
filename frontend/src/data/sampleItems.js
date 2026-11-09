/*
  A few example reports so the Home page has something to show.

  This is temporary. Stage 2.1 replaces it with the full mock data layer
  (shaped like the PostgreSQL tables), and Phase 5 replaces that with the
  real API.
*/
export const sampleItems = [
  {
    id: 'charger-library',
    type: 'LOST',
    title: 'Black Lenovo laptop charger',
    category: 'Electronics',
    location: 'Central Library, 2nd floor',
    date: '2026-11-01',
  },
  {
    id: 'bottle-cafeteria',
    type: 'FOUND',
    title: 'Blue steel water bottle',
    category: 'Water Bottles',
    location: 'Main Cafeteria',
    date: '2026-11-02',
  },
  {
    id: 'wallet-parking',
    type: 'LOST',
    title: 'Brown leather wallet',
    category: 'Accessories',
    location: 'Parking near CS Block',
    date: '2026-11-03',
  },
  {
    id: 'id-card-lecture-hall',
    type: 'FOUND',
    title: 'Student ID card',
    category: 'Documents',
    location: 'Lecture Hall Complex, LH-3',
    date: '2026-10-30',
  },
  {
    id: 'keys-hostel',
    type: 'LOST',
    title: 'Room keys with red keychain',
    category: 'Keys',
    location: 'Greenview Hostel, Block B',
    date: '2026-10-31',
  },
  {
    id: 'earbuds-sports',
    type: 'FOUND',
    title: 'White wireless earbuds case',
    category: 'Electronics',
    location: 'Sports Complex',
    date: '2026-10-28',
  },
  {
    id: 'watch-auditorium',
    type: 'LOST',
    title: 'Silver wristwatch',
    category: 'Accessories',
    location: 'Auditorium foyer',
    date: '2026-10-27',
  },
  {
    id: 'hoodie-mess',
    type: 'FOUND',
    title: 'Navy hoodie',
    category: 'Clothing',
    location: 'Greenview Hostel mess',
    date: '2026-11-03',
  },
]

// Communities that use Findr. Also temporary until Stage 2.1.
export const sampleCommunities = [
  {
    id: 'northfield-college',
    name: 'Northfield Institute of Technology',
    type: 'College',
    description: 'Library, lecture halls, cafeteria and sports complex.',
  },
  {
    id: 'greenview-hostel',
    name: 'Greenview Hostel',
    type: 'Hostel',
    description: 'Boys and girls hostel blocks, mess and common rooms.',
  },
  {
    id: 'lakeside-residency',
    name: 'Lakeside Residency',
    type: 'Residential colony',
    description: 'Homes, the central park, clubhouse and market.',
  },
]
