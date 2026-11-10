/*
  Mock database (Stage 2.1)

  The same 10 tables as dbms/03_schema.sql, with the same column names,
  filled with example rows. Pages never import this file directly: they
  go through the service files next to it (itemService.js and the rest).
  In Phase 5 those services call the real API instead, and the pages
  don't change.

  Differences from the real database, on purpose:
  - IDs are readable words like 'item-charger-library' instead of UUIDs,
    so URLs are easy to read while we build.
  - Verification answers are hashed with SHA-256 here. The backend will
    use Argon2id (Stage 4.5). The answer itself is never stored.
  - There are no password hashes yet. Login arrives in Stage 3.1.

  Answers to the private questions, for testing claims in Stage 3.3
  (answers are checked in lowercase, so capital letters don't matter):
    item-bottle-cafeteria   monstera     item-umbrella-gate     blue
    item-earbuds-sports     tanjiro      item-cycle-key         lion
    item-id-card-lh3        kabir        item-jacket-gym        receipt
    item-hoodie-mess        rcb          item-tiffin-common     3
    item-calculator-exam    neha         item-phone-bus-stop    mountains
    item-bottle-hostel      aarav
*/

// The person using the app in Phase 2. Stage 3.1 replaces this with a real login.
export const CURRENT_USER_ID = 'user-aarav'

export const users = [
  { user_id: 'user-aarav', full_name: 'Aarav Kapoor', email: 'aarav@northfield.edu', phone: '+91 98100 11111', profile_image_url: null, created_at: '2026-08-01T09:00:00+05:30' },
  { user_id: 'user-ananya', full_name: 'Ananya Sharma', email: 'ananya@northfield.edu', phone: '+91 98100 22222', profile_image_url: null, created_at: '2026-08-02T10:00:00+05:30' },
  { user_id: 'user-rohan', full_name: 'Rohan Verma', email: 'rohan@northfield.edu', phone: null, profile_image_url: null, created_at: '2026-08-02T11:30:00+05:30' },
  { user_id: 'user-kabir', full_name: 'Kabir Singh', email: 'kabir@northfield.edu', phone: '+91 98100 33333', profile_image_url: null, created_at: '2026-08-04T15:00:00+05:30' },
  { user_id: 'user-meera', full_name: 'Meera Iyer', email: 'meera@greenview.in', phone: null, profile_image_url: null, created_at: '2026-08-05T18:20:00+05:30' },
  { user_id: 'user-priya', full_name: 'Priya Nair', email: 'priya@lakesideresidency.in', phone: '+91 98100 44444', profile_image_url: null, created_at: '2026-08-10T08:45:00+05:30' },
  { user_id: 'user-arjun', full_name: 'Arjun Mehta', email: 'arjun@lakesideresidency.in', phone: null, profile_image_url: null, created_at: '2026-08-11T12:10:00+05:30' },
]

export const communities = [
  {
    community_id: 'northfield-college',
    name: 'Northfield Institute of Technology',
    community_type: 'COLLEGE',
    description: 'Library, lecture halls, cafeteria and sports complex.',
    address: 'Northfield Campus, Sonipat, Haryana',
    created_at: '2026-07-20T09:00:00+05:30',
  },
  {
    community_id: 'greenview-hostel',
    name: 'Greenview Hostel',
    community_type: 'HOSTEL',
    description: 'Boys and girls hostel blocks, mess and common rooms.',
    address: 'Greenview Road, next to Northfield Campus',
    created_at: '2026-07-22T09:00:00+05:30',
  },
  {
    community_id: 'lakeside-residency',
    name: 'Lakeside Residency',
    community_type: 'RESIDENTIAL_COLONY',
    description: 'Homes, the central park, clubhouse and market.',
    address: 'Lakeside Residency, Sector 9',
    created_at: '2026-07-25T09:00:00+05:30',
  },
]

export const community_memberships = [
  { membership_id: 'm-1', community_id: 'northfield-college', user_id: 'user-aarav', role: 'MEMBER', membership_status: 'ACTIVE', joined_at: '2026-08-01T09:05:00+05:30' },
  { membership_id: 'm-2', community_id: 'greenview-hostel', user_id: 'user-aarav', role: 'MEMBER', membership_status: 'ACTIVE', joined_at: '2026-08-01T09:10:00+05:30' },
  { membership_id: 'm-3', community_id: 'northfield-college', user_id: 'user-ananya', role: 'MEMBER', membership_status: 'ACTIVE', joined_at: '2026-08-02T10:05:00+05:30' },
  { membership_id: 'm-4', community_id: 'northfield-college', user_id: 'user-rohan', role: 'COMMUNITY_ADMIN', membership_status: 'ACTIVE', joined_at: '2026-08-02T11:35:00+05:30' },
  { membership_id: 'm-5', community_id: 'northfield-college', user_id: 'user-kabir', role: 'MEMBER', membership_status: 'ACTIVE', joined_at: '2026-08-04T15:05:00+05:30' },
  { membership_id: 'm-6', community_id: 'greenview-hostel', user_id: 'user-kabir', role: 'MEMBER', membership_status: 'ACTIVE', joined_at: '2026-08-04T15:10:00+05:30' },
  { membership_id: 'm-7', community_id: 'greenview-hostel', user_id: 'user-meera', role: 'COMMUNITY_ADMIN', membership_status: 'ACTIVE', joined_at: '2026-08-05T18:25:00+05:30' },
  { membership_id: 'm-8', community_id: 'lakeside-residency', user_id: 'user-priya', role: 'MEMBER', membership_status: 'ACTIVE', joined_at: '2026-08-10T08:50:00+05:30' },
  { membership_id: 'm-9', community_id: 'lakeside-residency', user_id: 'user-arjun', role: 'COMMUNITY_ADMIN', membership_status: 'ACTIVE', joined_at: '2026-08-11T12:15:00+05:30' },
]

// The same eight categories the schema seeds
export const categories = [
  { category_id: 'electronics', category_name: 'Electronics' },
  { category_id: 'bags', category_name: 'Bags' },
  { category_id: 'documents', category_name: 'Documents' },
  { category_id: 'clothing', category_name: 'Clothing' },
  { category_id: 'accessories', category_name: 'Accessories' },
  { category_id: 'keys', category_name: 'Keys' },
  { category_id: 'water-bottles', category_name: 'Water Bottles' },
  { category_id: 'other', category_name: 'Other' },
]

/*
  Items: every lost and found report.
  latitude and longitude are optional, but always both or neither (same rule as the schema).
  status is one of OPEN, CLAIM_PENDING, CLAIM_APPROVED, RETURNED, CLOSED.
*/
export const items = [
  {
    item_id: 'item-phone-bus-stop',
    reporter_id: 'user-ananya',
    community_id: 'northfield-college',
    category_id: 'electronics',
    report_type: 'FOUND',
    title: 'OnePlus phone with a cracked screen',
    description: 'Found on the bench at the college bus stop around 5 pm. The phone is locked and the battery is low. I have handed it to the security desk at Gate 1.',
    event_date: '2026-11-09',
    location_label: 'College bus stop, Gate 1',
    latitude: 28.9947,
    longitude: 77.0391,
    status: 'OPEN',
    created_at: '2026-11-09T17:20:00+05:30',
    updated_at: '2026-11-09T17:20:00+05:30',
  },
  {
    item_id: 'item-jacket-gym',
    reporter_id: 'user-rohan',
    community_id: 'northfield-college',
    category_id: 'clothing',
    report_type: 'FOUND',
    title: 'Red Puma track jacket',
    description: 'Left on a hook in the gym changing room after the evening slot. Medium size.',
    event_date: '2026-11-08',
    location_label: 'Gym changing room, Sports Complex',
    latitude: 28.9905,
    longitude: 77.0447,
    status: 'OPEN',
    created_at: '2026-11-08T20:05:00+05:30',
    updated_at: '2026-11-08T20:05:00+05:30',
  },
  {
    item_id: 'item-laptop-sleeve',
    reporter_id: 'user-aarav',
    community_id: 'greenview-hostel',
    category_id: 'bags',
    report_type: 'LOST',
    title: 'Laptop sleeve covered in stickers',
    description: 'Dark grey 14 inch sleeve with a NASA sticker and a lot of anime stickers. My charger was inside it.',
    event_date: '2026-11-08',
    location_label: 'Greenview Hostel, Block A lounge',
    latitude: 28.9889,
    longitude: 77.0472,
    status: 'OPEN',
    created_at: '2026-11-08T23:10:00+05:30',
    updated_at: '2026-11-08T23:10:00+05:30',
  },
  {
    item_id: 'item-glasses-park',
    reporter_id: 'user-arjun',
    community_id: 'lakeside-residency',
    category_id: 'accessories',
    report_type: 'LOST',
    title: 'Spectacles in a brown case',
    description: 'Reading glasses with thin black frames, in a brown hard case. I think I left them on a bench during my morning walk.',
    event_date: '2026-11-07',
    location_label: 'Central park, near the fountain',
    latitude: 28.9798,
    longitude: 77.0563,
    status: 'OPEN',
    created_at: '2026-11-07T09:40:00+05:30',
    updated_at: '2026-11-07T09:40:00+05:30',
  },
  {
    item_id: 'item-tiffin-common',
    reporter_id: 'user-kabir',
    community_id: 'greenview-hostel',
    category_id: 'other',
    report_type: 'FOUND',
    title: 'Steel tiffin box',
    description: 'A steel tiffin box left on the table in the common room after dinner. It is with the hostel warden now.',
    event_date: '2026-11-07',
    location_label: 'Greenview Hostel common room',
    latitude: null,
    longitude: null,
    status: 'OPEN',
    created_at: '2026-11-07T22:15:00+05:30',
    updated_at: '2026-11-07T22:15:00+05:30',
  },
  {
    item_id: 'item-calculator-exam',
    reporter_id: 'user-ananya',
    community_id: 'northfield-college',
    category_id: 'electronics',
    report_type: 'FOUND',
    title: 'Casio fx-991EX calculator',
    description: 'Found under a desk in Exam Hall 2 after the mid-sem paper. It has a name scratched on the back.',
    event_date: '2026-11-06',
    location_label: 'Exam Hall 2, Academic Block',
    latitude: 28.9928,
    longitude: 77.0434,
    status: 'OPEN',
    created_at: '2026-11-06T13:30:00+05:30',
    updated_at: '2026-11-06T13:30:00+05:30',
  },
  {
    item_id: 'item-backpack-lab',
    reporter_id: 'user-aarav',
    community_id: 'northfield-college',
    category_id: 'bags',
    report_type: 'LOST',
    title: 'Grey Wildcraft backpack',
    description: 'Grey backpack with a broken zip on the front pocket. It has my lab record and a blue umbrella inside.',
    event_date: '2026-11-05',
    location_label: 'Robotics Lab, Block D',
    latitude: 28.994,
    longitude: 77.0402,
    status: 'OPEN',
    created_at: '2026-11-05T18:00:00+05:30',
    updated_at: '2026-11-05T18:00:00+05:30',
  },
  {
    item_id: 'item-umbrella-gate',
    reporter_id: 'user-priya',
    community_id: 'lakeside-residency',
    category_id: 'other',
    report_type: 'FOUND',
    title: 'Black folding umbrella',
    description: 'Left at the guard cabin at the main gate during the evening rain. The guard has it.',
    event_date: '2026-11-04',
    location_label: 'Lakeside main gate',
    latitude: 28.9806,
    longitude: 77.0548,
    status: 'OPEN',
    created_at: '2026-11-04T19:45:00+05:30',
    updated_at: '2026-11-04T19:45:00+05:30',
  },
  {
    item_id: 'item-notebook-library',
    reporter_id: 'user-kabir',
    community_id: 'northfield-college',
    category_id: 'documents',
    report_type: 'LOST',
    title: 'Green spiral notebook with DBMS notes',
    description: 'A5 green spiral notebook. All my DBMS notes for the semester are in it, so I really need it back before the end-sems.',
    event_date: '2026-11-04',
    location_label: 'Central Library, reading room',
    latitude: 28.9932,
    longitude: 77.0411,
    status: 'OPEN',
    created_at: '2026-11-04T16:20:00+05:30',
    updated_at: '2026-11-04T16:20:00+05:30',
  },
  {
    item_id: 'item-wallet-parking',
    reporter_id: 'user-kabir',
    community_id: 'northfield-college',
    category_id: 'accessories',
    report_type: 'LOST',
    title: 'Brown leather wallet',
    description: 'Brown bi-fold wallet with my college ID and some cash. Probably fell out of my pocket while parking the bike.',
    event_date: '2026-11-03',
    location_label: 'Parking near CS Block',
    latitude: 28.9915,
    longitude: 77.0398,
    status: 'OPEN',
    created_at: '2026-11-03T10:15:00+05:30',
    updated_at: '2026-11-03T10:15:00+05:30',
  },
  {
    item_id: 'item-hoodie-mess',
    reporter_id: 'user-meera',
    community_id: 'greenview-hostel',
    category_id: 'clothing',
    report_type: 'FOUND',
    title: 'Navy hoodie',
    description: 'Navy blue hoodie left on a chair in the mess after breakfast. Something is printed on the back.',
    event_date: '2026-11-03',
    location_label: 'Greenview Hostel mess',
    latitude: 28.9882,
    longitude: 77.0476,
    status: 'OPEN',
    created_at: '2026-11-03T09:30:00+05:30',
    updated_at: '2026-11-03T09:30:00+05:30',
  },
  {
    item_id: 'item-bottle-cafeteria',
    reporter_id: 'user-rohan',
    community_id: 'northfield-college',
    category_id: 'water-bottles',
    report_type: 'FOUND',
    title: 'Blue steel water bottle',
    description: 'One litre blue steel bottle with a sticker on it, left on a table near the cafeteria counter.',
    event_date: '2026-11-02',
    location_label: 'Main Cafeteria',
    latitude: 28.9922,
    longitude: 77.0425,
    status: 'CLAIM_PENDING',
    created_at: '2026-11-02T14:00:00+05:30',
    updated_at: '2026-11-03T11:00:00+05:30',
  },
  {
    item_id: 'item-charger-library',
    reporter_id: 'user-ananya',
    community_id: 'northfield-college',
    category_id: 'electronics',
    report_type: 'LOST',
    title: 'Black Lenovo laptop charger',
    description: '65 W Lenovo charger with a round pin. I left it plugged in at a desk near the windows on the second floor.',
    event_date: '2026-11-01',
    location_label: 'Central Library, 2nd floor',
    latitude: 28.9931,
    longitude: 77.0409,
    status: 'OPEN',
    created_at: '2026-11-01T18:30:00+05:30',
    updated_at: '2026-11-01T18:30:00+05:30',
  },
  {
    item_id: 'item-cycle-key',
    reporter_id: 'user-arjun',
    community_id: 'lakeside-residency',
    category_id: 'keys',
    report_type: 'FOUND',
    title: 'Bicycle lock key on a ring',
    description: 'A small bicycle lock key on a metal ring with a keychain, found on the ground in the clubhouse parking.',
    event_date: '2026-11-01',
    location_label: 'Clubhouse parking',
    latitude: 28.9793,
    longitude: 77.0571,
    status: 'OPEN',
    created_at: '2026-11-01T08:10:00+05:30',
    updated_at: '2026-11-01T08:10:00+05:30',
  },
  {
    item_id: 'item-keys-hostel',
    reporter_id: 'user-meera',
    community_id: 'greenview-hostel',
    category_id: 'keys',
    report_type: 'LOST',
    title: 'Room keys with red keychain',
    description: 'Two keys on a red keychain shaped like a guitar. One is my room key and one is for my cupboard.',
    event_date: '2026-10-31',
    location_label: 'Greenview Hostel, Block B',
    latitude: 28.9887,
    longitude: 77.0484,
    status: 'OPEN',
    created_at: '2026-10-31T21:00:00+05:30',
    updated_at: '2026-10-31T21:00:00+05:30',
  },
  {
    item_id: 'item-id-card-lh3',
    reporter_id: 'user-ananya',
    community_id: 'northfield-college',
    category_id: 'documents',
    report_type: 'FOUND',
    title: 'Student ID card',
    description: 'Northfield student ID card found on the floor of LH-3 after the morning lecture.',
    event_date: '2026-10-30',
    location_label: 'Lecture Hall Complex, LH-3',
    latitude: 28.9937,
    longitude: 77.0428,
    status: 'RETURNED',
    created_at: '2026-10-30T11:00:00+05:30',
    updated_at: '2026-10-31T13:10:00+05:30',
  },
  {
    item_id: 'item-passport-copies',
    reporter_id: 'user-priya',
    community_id: 'lakeside-residency',
    category_id: 'documents',
    report_type: 'LOST',
    title: 'Folder with passport photocopies',
    description: 'A transparent plastic folder with photocopies of two passports and some passport-size photos.',
    event_date: '2026-10-29',
    location_label: 'Lakeside market, near the pharmacy',
    latitude: null,
    longitude: null,
    status: 'OPEN',
    created_at: '2026-10-29T17:50:00+05:30',
    updated_at: '2026-10-29T17:50:00+05:30',
  },
  {
    item_id: 'item-earbuds-sports',
    reporter_id: 'user-kabir',
    community_id: 'northfield-college',
    category_id: 'electronics',
    report_type: 'FOUND',
    title: 'White wireless earbuds case',
    description: 'White earbuds case (both earbuds inside) found near the basketball court. Something is written on the back.',
    event_date: '2026-10-28',
    location_label: 'Sports Complex, basketball court',
    latitude: 28.9908,
    longitude: 77.044,
    status: 'CLAIM_APPROVED',
    created_at: '2026-10-28T19:00:00+05:30',
    updated_at: '2026-10-29T10:30:00+05:30',
  },
  {
    item_id: 'item-watch-auditorium',
    reporter_id: 'user-rohan',
    community_id: 'northfield-college',
    category_id: 'accessories',
    report_type: 'LOST',
    title: 'Silver wristwatch',
    description: 'Silver Titan watch with a metal strap. Update: found it in my bag, closing this report.',
    event_date: '2026-10-27',
    location_label: 'Auditorium foyer',
    latitude: null,
    longitude: null,
    status: 'CLOSED',
    created_at: '2026-10-27T20:00:00+05:30',
    updated_at: '2026-10-28T08:00:00+05:30',
  },
  {
    item_id: 'item-bottle-hostel',
    reporter_id: 'user-meera',
    community_id: 'greenview-hostel',
    category_id: 'water-bottles',
    report_type: 'FOUND',
    title: 'Pink Milton water bottle',
    description: 'Pink Milton bottle with a name written on it in marker, left on the Block B stairs.',
    event_date: '2026-10-26',
    location_label: 'Greenview Hostel, Block B stairs',
    latitude: 28.9886,
    longitude: 77.0486,
    status: 'RETURNED',
    created_at: '2026-10-26T08:30:00+05:30',
    updated_at: '2026-10-27T18:40:00+05:30',
  },
]

// No photos in the seed data yet. Photos added through the Report form land here.
export const item_images = []

// One question per FOUND item. answer_hash is SHA-256 of the lowercase answer.
export const verification_questions = [
  { question_id: 'q-phone', item_id: 'item-phone-bus-stop', question_text: 'What is the lock screen wallpaper?', answer_hash: '5e23d5356b6462d0b2362c287dfdfc96244680f91b9a4c463fe1f72fc17ff0ec', is_active: true, created_at: '2026-11-09T17:20:00+05:30' },
  { question_id: 'q-jacket', item_id: 'item-jacket-gym', question_text: 'What is in the left pocket?', answer_hash: '6f32860910ca0fb2a20c7fda143666b09dbf8db5238195c90a586fb542ff0cad', is_active: true, created_at: '2026-11-08T20:05:00+05:30' },
  { question_id: 'q-tiffin', item_id: 'item-tiffin-common', question_text: 'How many compartments does it have?', answer_hash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce', is_active: true, created_at: '2026-11-07T22:15:00+05:30' },
  { question_id: 'q-calculator', item_id: 'item-calculator-exam', question_text: 'What name is scratched on the back?', answer_hash: 'a86d61e4c4516ca829dfb5a3b31186e0b2c11268b2d2a225384df86f71b72944', is_active: true, created_at: '2026-11-06T13:30:00+05:30' },
  { question_id: 'q-umbrella', item_id: 'item-umbrella-gate', question_text: 'What colour is the inside lining?', answer_hash: '16477688c0e00699c6cfa4497a3612d7e83c532062b64b250fed8908128ed548', is_active: true, created_at: '2026-11-04T19:45:00+05:30' },
  { question_id: 'q-hoodie', item_id: 'item-hoodie-mess', question_text: 'What is printed on the back?', answer_hash: '323aaa1aab2569c347f017cb2c03c7671ba8112a22e8cbf4b66d800802932d48', is_active: true, created_at: '2026-11-03T09:30:00+05:30' },
  { question_id: 'q-bottle-cafe', item_id: 'item-bottle-cafeteria', question_text: 'What sticker is on the bottle?', answer_hash: '2b12ea3d49373973a44a2f3d8dd3d640136094432a61eda76396586367131695', is_active: true, created_at: '2026-11-02T14:00:00+05:30' },
  { question_id: 'q-cycle-key', item_id: 'item-cycle-key', question_text: 'What is the keychain shaped like?', answer_hash: 'fc59487712bbe89b488847b77b5744fb6b815b8fc65ef2ab18149958edb61464', is_active: true, created_at: '2026-11-01T08:10:00+05:30' },
  { question_id: 'q-id-card', item_id: 'item-id-card-lh3', question_text: 'What first name is printed on the card?', answer_hash: 'f8628a3fffd6b87bd309b2873b7aaa5bf9df0e3c18c383b07c37554449d91fdb', is_active: true, created_at: '2026-10-30T11:00:00+05:30' },
  { question_id: 'q-earbuds', item_id: 'item-earbuds-sports', question_text: 'What is written on the back of the case?', answer_hash: 'f742b0b9d3bdfede74c153006755c31974f6e6b36ad44ef3e3c07ebe7a667c8a', is_active: true, created_at: '2026-10-28T19:00:00+05:30' },
  { question_id: 'q-bottle-hostel', item_id: 'item-bottle-hostel', question_text: 'What name is written on the bottle?', answer_hash: '70c64570680ddcef112f9cd6bfe44f671b40fa653beacc67ab2832792b42934d', is_active: true, created_at: '2026-10-26T08:30:00+05:30' },
]

/*
  Claims explain the item statuses above:
  - The cafeteria bottle has a PENDING claim, so it is CLAIM_PENDING.
  - The earbuds have an APPROVED claim and a SCHEDULED handover, so they are CLAIM_APPROVED.
  - The ID card and the pink bottle were handed over, so they are RETURNED.
  reviewed_by is always the finder (the item's reporter), as the schema's trigger requires.
*/
export const claims = [
  { claim_id: 'claim-1', item_id: 'item-bottle-cafeteria', claimant_id: 'user-kabir', verification_passed_at: '2026-11-03T11:00:00+05:30', status: 'PENDING', review_note: null, reviewed_by: null, reviewed_at: null, created_at: '2026-11-03T11:00:00+05:30', updated_at: '2026-11-03T11:00:00+05:30' },
  { claim_id: 'claim-2', item_id: 'item-earbuds-sports', claimant_id: 'user-ananya', verification_passed_at: '2026-10-29T09:10:00+05:30', status: 'APPROVED', review_note: 'Described the engraving exactly.', reviewed_by: 'user-kabir', reviewed_at: '2026-10-29T10:30:00+05:30', created_at: '2026-10-29T09:10:00+05:30', updated_at: '2026-10-29T10:30:00+05:30' },
  { claim_id: 'claim-3', item_id: 'item-id-card-lh3', claimant_id: 'user-kabir', verification_passed_at: '2026-10-30T15:00:00+05:30', status: 'APPROVED', review_note: null, reviewed_by: 'user-ananya', reviewed_at: '2026-10-30T16:00:00+05:30', created_at: '2026-10-30T15:00:00+05:30', updated_at: '2026-10-30T16:00:00+05:30' },
  { claim_id: 'claim-4', item_id: 'item-bottle-hostel', claimant_id: 'user-kabir', verification_passed_at: '2026-10-26T12:00:00+05:30', status: 'REJECTED', review_note: 'Could not describe where the bottle was left.', reviewed_by: 'user-meera', reviewed_at: '2026-10-26T20:00:00+05:30', created_at: '2026-10-26T12:00:00+05:30', updated_at: '2026-10-26T20:00:00+05:30' },
  { claim_id: 'claim-5', item_id: 'item-bottle-hostel', claimant_id: 'user-aarav', verification_passed_at: '2026-10-26T19:30:00+05:30', status: 'APPROVED', review_note: null, reviewed_by: 'user-meera', reviewed_at: '2026-10-26T20:05:00+05:30', created_at: '2026-10-26T19:30:00+05:30', updated_at: '2026-10-26T20:05:00+05:30' },
]

export const handovers = [
  { handover_id: 'handover-1', claim_id: 'claim-2', scheduled_at: '2026-11-11T13:00:00+05:30', completed_at: null, handover_location: 'Sports Complex reception', confirmation_note: null, status: 'SCHEDULED' },
  { handover_id: 'handover-2', claim_id: 'claim-3', scheduled_at: '2026-10-31T13:00:00+05:30', completed_at: '2026-10-31T13:10:00+05:30', handover_location: 'Library entrance', confirmation_note: 'Handed over in person.', status: 'COMPLETED' },
  { handover_id: 'handover-3', claim_id: 'claim-5', scheduled_at: '2026-10-27T18:30:00+05:30', completed_at: '2026-10-27T18:40:00+05:30', handover_location: 'Greenview Hostel warden office', confirmation_note: null, status: 'COMPLETED' },
]

export const notifications = [
  { notification_id: 'n-1', user_id: 'user-rohan', related_item_id: 'item-bottle-cafeteria', related_claim_id: 'claim-1', notification_type: 'CLAIM_SUBMITTED', message: 'Kabir Singh claimed your Blue steel water bottle.', is_read: false, created_at: '2026-11-03T11:00:00+05:30' },
  { notification_id: 'n-2', user_id: 'user-ananya', related_item_id: 'item-earbuds-sports', related_claim_id: 'claim-2', notification_type: 'CLAIM_APPROVED', message: 'Your claim on the White wireless earbuds case was approved.', is_read: true, created_at: '2026-10-29T10:30:00+05:30' },
  { notification_id: 'n-3', user_id: 'user-ananya', related_item_id: 'item-earbuds-sports', related_claim_id: 'claim-2', notification_type: 'HANDOVER_SCHEDULED', message: 'Handover set for 11 Nov, 1:00 pm at the Sports Complex reception.', is_read: false, created_at: '2026-10-29T10:35:00+05:30' },
  { notification_id: 'n-4', user_id: 'user-kabir', related_item_id: 'item-bottle-hostel', related_claim_id: 'claim-4', notification_type: 'CLAIM_REJECTED', message: 'Your claim on the Pink Milton water bottle was not approved.', is_read: true, created_at: '2026-10-26T20:00:00+05:30' },
  { notification_id: 'n-5', user_id: 'user-aarav', related_item_id: 'item-bottle-hostel', related_claim_id: 'claim-5', notification_type: 'CLAIM_APPROVED', message: 'Your claim on the Pink Milton water bottle was approved.', is_read: true, created_at: '2026-10-26T20:05:00+05:30' },
  { notification_id: 'n-6', user_id: 'user-aarav', related_item_id: 'item-bottle-hostel', related_claim_id: 'claim-5', notification_type: 'HANDOVER_COMPLETED', message: 'Handover complete. The Pink Milton water bottle is marked returned.', is_read: true, created_at: '2026-10-27T18:40:00+05:30' },
]
