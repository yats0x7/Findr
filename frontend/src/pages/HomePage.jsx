import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import ItemCard from '../components/ItemCard'
import { sampleCommunities, sampleItems } from '../data/sampleItems'
import '../styles/pages/home.css'

// The four steps of Findr, shown in the "How Findr works" section
const HOW_IT_WORKS = [
  {
    title: 'Report it',
    text: 'Post what you lost or found, with a photo, the place and the date.',
  },
  {
    title: 'Discover it',
    text: 'Search, filter or open the map to find a matching report.',
  },
  {
    title: 'Prove it is yours',
    text: 'Answer the finder’s private question. Only the real owner knows the answer.',
  },
  {
    title: 'Get it back',
    text: 'The finder approves your claim, you meet, and the item is marked returned.',
  },
]

// Why Findr beats the usual WhatsApp group
const REASONS = [
  {
    title: 'Nothing gets buried',
    text: 'Every report stays searchable, instead of disappearing under hundreds of messages.',
  },
  {
    title: 'No fake claims',
    text: 'Claims need the answer to a private question, so “that’s mine!” is not enough.',
  },
  {
    title: 'Tracked to the end',
    text: 'You can see whether a claim was approved and when the item was handed back.',
  },
]

// Newest first, so the Home page shows the latest reports
function newestFirst(itemA, itemB) {
  return itemB.date.localeCompare(itemA.date)
}

function HomePage() {
  const [searchText, setSearchText] = useState('')
  const navigate = useNavigate()

  const recentlyLost = sampleItems.filter((item) => item.type === 'LOST').sort(newestFirst).slice(0, 4)
  const recentlyFound = sampleItems.filter((item) => item.type === 'FOUND').sort(newestFirst).slice(0, 4)

  // Searching from Home takes you to Explore with the search already filled in
  function handleSearch(event) {
    event.preventDefault()
    const query = searchText.trim()
    navigate(query ? `/explore?q=${encodeURIComponent(query)}` : '/explore')
  }

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="hero-eyebrow">Lost &amp; found for your campus</span>
            <h1>
              Lost something? <span className="hero-highlight">Someone nearby</span> probably found it.
            </h1>
            <p className="hero-subtitle">
              Findr brings your college, hostel or colony’s lost and found into one searchable place, and makes sure
              items go back to their real owners.
            </p>

            <form className="hero-search" onSubmit={handleSearch} role="search">
              <label htmlFor="home-search" className="visually-hidden">
                Search lost and found items
              </label>
              <input
                id="home-search"
                className="input"
                type="search"
                placeholder="Try “black wallet” or “AirPods”"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
              <Button type="submit">Search</Button>
            </form>

            <div className="hero-actions">
              <Button to="/report?type=lost" variant="lost" size="large">
                I lost something
              </Button>
              <Button to="/report?type=found" variant="found" size="large">
                I found something
              </Button>
            </div>
          </div>

          {/* A small picture of a claim being verified, built from plain HTML and CSS */}
          <div className="hero-preview" aria-hidden="true">
            <div className="preview-card preview-card-back">
              <span className="badge badge-lost">Lost</span>
              <strong>Blue water bottle</strong>
              <span className="preview-muted">Main Cafeteria · 2 Nov</span>
            </div>

            <div className="preview-card preview-card-front">
              <div className="preview-card-top">
                <span className="badge badge-found">Found</span>
                <span className="preview-muted">Main Cafeteria</span>
              </div>
              <strong className="preview-title">Blue steel water bottle</strong>

              <div className="preview-question">
                <span className="preview-label">Private question</span>
                <span>What sticker is on the bottle?</span>
              </div>

              <div className="preview-answer">
                <span className="preview-label">Owner’s answer</span>
                <span className="preview-dots">● ● ● ● ● ● ●</span>
              </div>

              <div className="preview-verified">
                <span className="preview-tick">✓</span>
                Answer matched. Claim sent to the finder.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Recently lost ---------- */}
      <section className="container page-section">
        <div className="section-heading">
          <div>
            <h2>Recently lost</h2>
            <p>Seen any of these? Report it as found.</p>
          </div>
          <Link to="/explore?type=lost">See all lost items →</Link>
        </div>
        <div className="card-grid">
          {recentlyLost.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* ---------- Recently found ---------- */}
      <section className="container page-section home-section-tight">
        <div className="section-heading">
          <div>
            <h2>Recently found</h2>
            <p>Is one of these yours? Open it and make a claim.</p>
          </div>
          <Link to="/explore?type=found">See all found items →</Link>
        </div>
        <div className="card-grid">
          {recentlyFound.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* ---------- How Findr works ---------- */}
      <section className="how-it-works">
        <div className="container page-section">
          <div className="section-heading">
            <div>
              <h2>How Findr works</h2>
              <p>From “I lost it” to “I got it back” in four steps.</p>
            </div>
          </div>

          <ol className="steps">
            {HOW_IT_WORKS.map((step, index) => (
              <li key={step.title} className="step">
                <span className="step-number">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Why Findr ---------- */}
      <section className="container page-section">
        <div className="section-heading">
          <div>
            <h2>Better than a WhatsApp group</h2>
            <p>Built for the way lost items actually get found.</p>
          </div>
        </div>
        <div className="reasons">
          {REASONS.map((reason) => (
            <div key={reason.title} className="card">
              <h3>{reason.title}</h3>
              <p className="reason-text">{reason.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Communities ---------- */}
      <section className="container page-section home-section-tight">
        <div className="section-heading">
          <div>
            <h2>Browse communities</h2>
            <p>Findr works inside a college, a hostel or a residential colony.</p>
          </div>
        </div>
        <div className="communities">
          {sampleCommunities.map((community) => (
            <Link key={community.id} to={`/explore?community=${community.id}`} className="card community-card">
              <span className="badge badge-neutral">{community.type}</span>
              <h3>{community.name}</h3>
              <p>{community.description}</p>
              <span className="community-link">Browse items →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Sign up call to action ---------- */}
      <section className="container">
        <div className="join-banner">
          <div>
            <h2>Join your community on Findr</h2>
            <p>Anyone can browse. Create an account to report items and claim what is yours.</p>
          </div>
          <div className="join-actions">
            <Button to="/signup" size="large">
              Create an account
            </Button>
            <Button to="/login" variant="secondary" size="large">
              Log in
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
