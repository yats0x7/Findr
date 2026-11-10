import { Link } from 'react-router-dom'
import Badge from './Badge'
import { formatDate } from '../utils/formatDate'

/*
  A preview card for one lost or found item.
  Clicking it opens that item's details page (/items/:id).

  `item` is an item from itemService. The card shows the first photo if
  there is one, otherwise the first letter of the item name on a red
  (lost) or green (found) tile.
*/
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
          {/* Open is the normal state, so only the other statuses get a badge */}
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
