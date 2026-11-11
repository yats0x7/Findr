import L from 'leaflet'

// OSM tiles need the attribution shown on every map

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// demo campus
export const DEFAULT_CENTER = [28.9905, 77.045]
export const DEFAULT_ZOOM = 15

// Leaflet's default marker png breaks with vite and can't be recoloured,
// so pins are divIcons styled in components.css (.map-pin)
function makePin(kind) {
  return L.divIcon({
    className: `map-pin map-pin-${kind}`,
    html: '<span></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -26],
  })
}

export const PIN_ICONS = {
  LOST: makePin('lost'),
  FOUND: makePin('found'),
}

// average position of the pinned items
export function centreOf(items) {
  const pinned = items.filter((item) => item.latitude !== null && item.longitude !== null)
  if (pinned.length === 0) {
    return DEFAULT_CENTER
  }

  const latitude = pinned.reduce((total, item) => total + item.latitude, 0) / pinned.length
  const longitude = pinned.reduce((total, item) => total + item.longitude, 0) / pinned.length
  return [latitude, longitude]
}
