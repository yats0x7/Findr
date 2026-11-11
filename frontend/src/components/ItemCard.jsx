import { Link } from 'react-router-dom'
import Badge from './Badge'
import { formatDate } from '../utils/formatDate'

// Shows the first photo, or the first letter on a red/green tile if there isn't one
function ItemCard({ item }) {
  const isLost = item.report_type === 'LOST'
  const firstLetter = item.title.charAt(0).toUpperCase()
  const photo = item.images && item.images[0]

  return (
    <Link to={`/items/${item.item_id}`} className="item-card">
      <div className={`item-card-picture ${isLost ? 'is-lost' : 'is-found'}`}>
        {photo ? <img src={photo.image_url} alt="" /> : <span aria-hidden="true">{firstLetter}</span>}
        <div className="item-card-badges">
          <Badge status={item.report_type} />
          {/* OPEN is the default so it doesn't need a badge */}
          {item.status !== 'OPEN' && <Badge status={item.status} />}
        </div>
      </div>

      <div className="item-card-details">
        <span className="item-card-title">{item.title}</span>
        <span className="item-card-meta">{item.location_label}</span>
        <span className="item-card-meta">
          {isLost ? 'Lost on' : 'Found on'} {formatDate(item.event_date)}
        </span>
      </div>
    </Link>
  )
}

export default ItemCard
