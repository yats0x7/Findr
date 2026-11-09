import { Link } from 'react-router-dom'
import Badge from './Badge'
import { formatDate } from '../utils/formatDate'

/*
  A preview card for one lost or found item.
  Clicking it opens that item's details page (/items/:id).

  Until photo uploads exist (Stage 2.4), the picture area shows the
  first letter of the item name on a red (lost) or green (found) tile.
*/
function ItemCard({ item }) {
  const isLost = item.type === 'LOST'
  const firstLetter = item.title.charAt(0).toUpperCase()

  return (
    <Link to={`/items/${item.id}`} className="item-card">
      <div className={`item-card-picture ${isLost ? 'is-lost' : 'is-found'}`}>
        <Badge status={item.type} />
        <span aria-hidden="true">{firstLetter}</span>
      </div>

      <div className="item-card-details">
        <span className="item-card-title">{item.title}</span>
        <span className="item-card-meta">{item.location}</span>
        <span className="item-card-meta">
          {isLost ? 'Lost on' : 'Found on'} {formatDate(item.date)}
        </span>
      </div>
    </Link>
  )
}

export default ItemCard
