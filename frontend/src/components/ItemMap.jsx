import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import Badge from './Badge'
import { hasMapLocation } from '../services/itemService'
import { formatDate } from '../utils/formatDate'
import { DEFAULT_CENTER, DEFAULT_ZOOM, PIN_ICONS, TILE_ATTRIBUTION, TILE_URL } from '../utils/map'

// Used on the Map page and the small map on item details. Items without lat/lng are skipped.

// zoom to fit all pins whenever they change
function FitToPins({ positions }) {
  const map = useMap()

  useEffect(() => {
    if (positions.length === 1) {
      map.setView(positions[0], 17)
    } else if (positions.length > 1) {
      map.fitBounds(positions, { padding: [40, 40], maxZoom: 17 })
    }
  }, [map, positions])

  return null
}

function ItemMap({ items, className = '', showPopups = true, scrollWheelZoom = true }) {
  const pinnedItems = useMemo(() => items.filter(hasMapLocation), [items])
  const positions = useMemo(() => pinnedItems.map((item) => [item.latitude, item.longitude]), [pinnedItems])

  return (
    <MapContainer
      className={`item-map ${className}`}
      center={positions[0] || DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom={scrollWheelZoom}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <FitToPins positions={positions} />

      {pinnedItems.map((item) => (
        <Marker
          key={item.item_id}
          position={[item.latitude, item.longitude]}
          icon={PIN_ICONS[item.report_type]}
          title={item.title}
          alt={`${item.report_type === 'LOST' ? 'Lost' : 'Found'}: ${item.title}`}
        >
          {showPopups && (
            <Popup>
              <div className="map-popup">
                <div className="map-popup-badges">
                  <Badge status={item.report_type} />
                  {item.status !== 'OPEN' && <Badge status={item.status} />}
                </div>
                <strong>{item.title}</strong>
                <span>{item.location_label}</span>
                <span>
                  {item.report_type === 'LOST' ? 'Lost on' : 'Found on'} {formatDate(item.event_date)}
                </span>
                <Link to={`/items/${item.item_id}`}>View details →</Link>
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  )
}

export default ItemMap
