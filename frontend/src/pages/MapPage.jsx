import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import FilterPanel from '../components/FilterPanel'
import ItemMap from '../components/ItemMap'
import { useAsync } from '../hooks/useAsync'
import { useItemFilters } from '../hooks/useItemFilters'
import { hasMapLocation, listItems } from '../services/itemService'
import { listCategories, listCommunities } from '../services/referenceService'
import '../styles/pages/map.css'

function MapPage() {
  const filters = useItemFilters()
  const { serviceFilters, queryString, hasAnyFilter } = filters

  const lists = useAsync(() => Promise.all([listCategories(), listCommunities()]), [])
  const [categories, communities] = lists.data || [[], []]

  const results = useAsync(() => listItems(serviceFilters), [JSON.stringify(serviceFilters)])

  // memo so the map only re-fits when the results actually change
  const { pinned, unpinnedCount } = useMemo(() => {
    const all = results.data || []
    const withPin = all.filter(hasMapLocation)
    return { pinned: withPin, unpinnedCount: all.length - withPin.length }
  }, [results.data])

  const lostCount = pinned.filter((item) => item.report_type === 'LOST').length
  const foundCount = pinned.length - lostCount
  const exploreLink = queryString ? `/explore?${queryString}` : '/explore'

  return (
    <div className="container map-page">
      <header className="map-header">
        <div>
          <h1>Map</h1>
          <p>Where items were lost and found. Tap a pin for details.</p>
        </div>
        <Button to={exploreLink} variant="secondary">
          View as list
        </Button>
      </header>

      <FilterPanel filters={filters} categories={categories} communities={communities} layout="bar" id="map-filters" />

      <div className="map-legend" aria-live="polite">
        <span className="map-legend-item">
          <span className="map-legend-dot is-lost" aria-hidden="true" />
          Lost ({lostCount})
        </span>
        <span className="map-legend-item">
          <span className="map-legend-dot is-found" aria-hidden="true" />
          Found ({foundCount})
        </span>
        {results.isLoading && <span className="map-legend-loading">Updating…</span>}
      </div>

      {results.error ? (
        <EmptyState title="Couldn't load the map" text="Something went wrong. Refresh the page to try again." />
      ) : (
        <div className="map-frame">
          <ItemMap items={pinned} className="map-main" />
          {results.data && pinned.length === 0 && (
            <div className="map-overlay">
              <p>{hasAnyFilter ? 'No pinned items match these filters.' : 'No items have been pinned yet.'}</p>
            </div>
          )}
        </div>
      )}

      {unpinnedCount > 0 && (
        <p className="map-note">
          {unpinnedCount} matching {unpinnedCount === 1 ? 'report has' : 'reports have'} no pin.{' '}
          <Link to={exploreLink}>See {unpinnedCount === 1 ? 'it' : 'them'} in Explore</Link>.
        </p>
      )}
    </div>
  )
}

export default MapPage
