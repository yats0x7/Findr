import { useEffect } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { DEFAULT_ZOOM, PIN_ICONS, TILE_ATTRIBUTION, TILE_URL } from '../utils/map'

// Click to drop a pin on the Report form, drag to move it.
// value is { latitude, longitude } or null. centre is used while there's no pin.

// 6 decimals to match NUMERIC(9,6)
function round(value) {
  return Math.round(value * 1e6) / 1e6
}

function ClickToPin({ onChange }) {
  useMapEvents({
    click(event) {
      onChange({ latitude: round(event.latlng.lat), longitude: round(event.latlng.lng) })
    },
  })
  return null
}

// recentre when the community changes (only if nothing is pinned yet)
function FollowCentre({ centre, hasPin }) {
  const map = useMap()

  useEffect(() => {
    if (!hasPin) {
      map.setView(centre, DEFAULT_ZOOM)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, centre[0], centre[1]])

  return null
}

function LocationPicker({ value, onChange, centre, reportType }) {
  const start = value ? [value.latitude, value.longitude] : centre

  return (
    <MapContainer className="location-picker" center={start} zoom={DEFAULT_ZOOM} scrollWheelZoom={false}>
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <ClickToPin onChange={onChange} />
      <FollowCentre centre={centre} hasPin={Boolean(value)} />
      {value && (
        <Marker
          position={[value.latitude, value.longitude]}
          icon={PIN_ICONS[reportType]}
          draggable
          eventHandlers={{
            dragend(event) {
              const { lat, lng } = event.target.getLatLng()
              onChange({ latitude: round(lat), longitude: round(lng) })
            },
          }}
        />
      )}
    </MapContainer>
  )
}

export default LocationPicker
