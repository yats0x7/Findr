import Badge from '../components/Badge'
import Button from '../components/Button'
import ItemCard from '../components/ItemCard'
import { useAsync } from '../hooks/useAsync'
import { listItems } from '../services/itemService'
import '../styles/pages/style-guide.css'

/*
  The design system on one page (/style-guide).

  Not linked from the navbar: it is a reference for the team, so everyone
  uses the same buttons, badges, cards and colours.
*/
const COLOURS = [
  { name: 'Primary', variable: '--color-primary' },
  { name: 'Lost', variable: '--color-lost' },
  { name: 'Found', variable: '--color-found' },
  { name: 'Warning', variable: '--color-warning' },
  { name: 'Info', variable: '--color-info' },
  { name: 'Text', variable: '--color-text' },
  { name: 'Muted text', variable: '--color-text-muted' },
  { name: 'Border', variable: '--color-border' },
]

const STATUSES = ['LOST', 'FOUND', 'OPEN', 'CLAIM_PENDING', 'CLAIM_APPROVED', 'RETURNED', 'CLOSED']

function StyleGuidePage() {
  const exampleItems = useAsync(() => listItems({ limit: 3 }), []).data || []

  return (
    <div className="container style-guide">
      <h1>Style guide</h1>
      <p className="style-guide-intro">
        Every shared piece of Findr's design. Use these instead of styling things from scratch.
      </p>

      <section className="style-guide-section">
        <h2>Colours</h2>
        <div className="colour-grid">
          {COLOURS.map((colour) => (
            <div key={colour.variable} className="colour-swatch">
              <span className="colour-chip" style={{ background: `var(${colour.variable})` }} />
              <strong>{colour.name}</strong>
              <code>{colour.variable}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="style-guide-section">
        <h2>Type</h2>
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <p>Body text. Findr helps people get their things back.</p>
      </section>

      <section className="style-guide-section">
        <h2>Buttons</h2>
        <div className="style-guide-row">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="lost">I lost something</Button>
          <Button variant="found">I found something</Button>
        </div>
        <div className="style-guide-row">
          <Button size="small">Small</Button>
          <Button>Medium</Button>
          <Button size="large">Large</Button>
        </div>
      </section>

      <section className="style-guide-section">
        <h2>Status badges</h2>
        <div className="style-guide-row">
          {STATUSES.map((status) => (
            <Badge key={status} status={status} />
          ))}
        </div>
      </section>

      <section className="style-guide-section">
        <h2>Form inputs</h2>
        <div className="style-guide-form">
          <label className="field">
            <span className="field-label">Item name</span>
            <input className="input" placeholder="e.g. Black laptop charger" />
          </label>
          <label className="field">
            <span className="field-label">Category</span>
            <select className="input" defaultValue="">
              <option value="" disabled>
                Pick a category
              </option>
              <option>Electronics</option>
              <option>Bags</option>
            </select>
          </label>
        </div>
      </section>

      <section className="style-guide-section">
        <h2>Item cards</h2>
        <div className="card-grid">
          {exampleItems.map((item) => (
            <ItemCard key={item.item_id} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default StyleGuidePage
