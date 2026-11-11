import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Badge from '../components/Badge'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import ItemCard from '../components/ItemCard'
import ItemMap from '../components/ItemMap'
import { useAsync } from '../hooks/useAsync'
import { getItem, hasMapLocation, listSimilarItems } from '../services/itemService'
import { formatDate } from '../utils/formatDate'
import { COMMUNITY_TYPE_LABELS } from '../utils/labels'
import '../styles/pages/item-details.css'

// Claim button only on FOUND items that are still open. LOST items get "I found this" instead.
// The private question isn't shown here, only on the claim form (3.3).

function NextStep({ item }) {
  if (item.report_type === 'LOST') {
    if (item.status === 'CLOSED') {
      return <p className="details-next-text">The owner closed this report.</p>
    }
    return (
      <>
        <h2>Have you seen this?</h2>
        <p className="details-next-text">If you found it, post a found report so the owner can claim it.</p>
        <Button to="/report?type=found" variant="found">
          I found this
        </Button>
      </>
    )
  }

  if (item.status === 'OPEN' || item.status === 'CLAIM_PENDING') {
    return (
      <>
        <h2>Is this yours?</h2>
        <p className="details-next-text">
          To claim it, you answer a private question set by the finder. Only the real owner should know the answer.
        </p>
        {/* needs login (3.1), which should send them back here. claim form is 3.3 */}
        <Button to={`/login?redirect=${encodeURIComponent(`/items/${item.item_id}`)}`} size="large">
          Claim this item
        </Button>
      </>
    )
  }

  const message = {
    CLAIM_APPROVED: 'The finder approved a claim, and the handover is being arranged.',
    RETURNED: 'This item is back with its owner.',
    CLOSED: 'The finder closed this report. It no longer takes claims.',
  }[item.status]

  return <p className="details-next-text">{message}</p>
}

function PhotoGallery({ item }) {
  const [selected, setSelected] = useState(0)
  const isLost = item.report_type === 'LOST'

  if (item.images.length === 0) {
    return (
      <div className={`details-photo details-photo-empty ${isLost ? 'is-lost' : 'is-found'}`}>
        <span aria-hidden="true">{item.title.charAt(0).toUpperCase()}</span>
        <p>No photo added</p>
      </div>
    )
  }

  const photo = item.images[Math.min(selected, item.images.length - 1)]

  return (
    <div className="details-gallery">
      <img className="details-photo" src={photo.image_url} alt={`Photo of ${item.title}`} />
      {item.images.length > 1 && (
        <div className="details-thumbnails">
          {item.images.map((image, index) => (
            <button
              key={image.image_id}
              type="button"
              className={`details-thumbnail ${index === selected ? 'is-selected' : ''}`}
              aria-label={`Show photo ${index + 1}`}
              aria-pressed={index === selected}
              onClick={() => setSelected(index)}
            >
              <img src={image.image_url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ItemDetailsPage() {
  const { id } = useParams()
  const location = useLocation()

  // set by the Report form after posting
  const justReported = location.state?.justReported
  const photosNotSaved = location.state?.photosSaved === false

  const itemRequest = useAsync(() => getItem(id), [id])
  const similarRequest = useAsync(() => listSimilarItems(id), [id])
  const item = itemRequest.data

  // clicking a similar item changes the id but `item` is still the old one until it loads
  const isWaitingForItem = itemRequest.isLoading && (!item || item.item_id !== id)

  if (isWaitingForItem) {
    return (
      <div className="container details-page">
        <p className="loading-text">Loading item…</p>
      </div>
    )
  }

  if (itemRequest.error || !item) {
    return (
      <div className="container details-page">
        <EmptyState
          title="We couldn't find this item"
          text="It may have been removed, or the link is wrong. Try searching for it instead."
        >
          <Button to="/explore">Explore items</Button>
        </EmptyState>
      </div>
    )
  }

  const isLost = item.report_type === 'LOST'
  const similarItems = similarRequest.data || []

  return (
    <div className="container details-page">
      {justReported && (
        <div className="alert alert-success" role="status">
          <strong>Your report is live.</strong> It now shows in Explore{hasMapLocation(item) ? ' and on the map' : ''}.
          {photosNotSaved && ' Your photos were too large to keep after a reload; they show until then.'}
        </div>
      )}

      <Link to="/explore" className="details-back">
        ← Back to Explore
      </Link>

      <div className="details-layout">
        <PhotoGallery key={item.item_id} item={item} />

        <div className="details-info">
          <div className="details-badges">
            <Badge status={item.report_type} />
            <Badge status={item.status} />
          </div>
          <h1>{item.title}</h1>
          <p className="details-description">{item.description}</p>

          <dl className="details-facts">
            <div>
              <dt>{isLost ? 'Lost on' : 'Found on'}</dt>
              <dd>{formatDate(item.event_date)}</dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd>{item.location_label}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>
                <Link to={`/explore?category=${item.category_id}`}>{item.category_name}</Link>
              </dd>
            </div>
            <div>
              <dt>Community</dt>
              <dd>
                <Link to={`/explore?community=${item.community_id}`}>{item.community_name}</Link>
                <span className="details-muted"> · {COMMUNITY_TYPE_LABELS[item.community_type]}</span>
              </dd>
            </div>
            <div>
              <dt>Reported by</dt>
              <dd>
                {item.reporter_name}
                <span className="details-muted"> · {formatDate(item.created_at)}</span>
              </dd>
            </div>
          </dl>

          <div className="details-next">
            <NextStep item={item} />
          </div>
        </div>
      </div>

      {hasMapLocation(item) && (
        <section className="details-section">
          <div className="section-heading">
            <div>
              <h2>Where it was {isLost ? 'lost' : 'found'}</h2>
              <p>The pin shows the approximate spot.</p>
            </div>
            <Link to="/map">Open the full map →</Link>
          </div>
          <ItemMap items={[item]} className="details-map" showPopups={false} scrollWheelZoom={false} />
        </section>
      )}

      {similarItems.length > 0 && (
        <section className="details-section">
          <div className="section-heading">
            <div>
              <h2>Similar items</h2>
              <p>
                More reports in {item.category_name}
                {isLost ? ', with found items first in case one of them is yours' : ''}.
              </p>
            </div>
          </div>
          <div className="card-grid">
            {similarItems.map((similar) => (
              <ItemCard key={similar.item_id} item={similar} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ItemDetailsPage
