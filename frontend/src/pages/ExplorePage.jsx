import { useState } from 'react'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import FilterPanel from '../components/FilterPanel'
import ItemCard from '../components/ItemCard'
import { useAsync } from '../hooks/useAsync'
import { useItemFilters } from '../hooks/useItemFilters'
import { listItems } from '../services/itemService'
import { listCategories, listCommunities } from '../services/referenceService'
import '../styles/pages/explore.css'

/*
  Explore (Stage 2.2): every lost and found report, with search, filters
  and sorting. All of it lives in the URL (see useItemFilters), so the
  Home page can link straight to "/explore?type=found" and a filtered
  list can be shared.
*/
function ExplorePage() {
  const filters = useItemFilters()
  const { values, setFilter, serviceFilters, activeCount, hasAnyFilter, clearFilters, queryString } = filters

  // On phones the filters fold away behind a button
  const [showFilters, setShowFilters] = useState(false)

  const lists = useAsync(() => Promise.all([listCategories(), listCommunities()]), [])
  const [categories, communities] = lists.data || [[], []]

  // Reload the results whenever any filter in the URL changes
  const results = useAsync(() => listItems(serviceFilters), [JSON.stringify(serviceFilters)])
  const items = results.data || []

  let resultsSummary = 'Loading items…'
  if (results.data) {
    resultsSummary = `${items.length} ${items.length === 1 ? 'item' : 'items'}${hasAnyFilter ? ' match' : ''}`
  }

  return (
    <div className="container explore-page">
      <header className="explore-header">
        <div>
          <h1>Explore items</h1>
          <p>Browse every lost and found report. Filter by type, category, community, status, place or date.</p>
        </div>
        <Button to={queryString ? `/map?${queryString}` : '/map'} variant="secondary">
          View on map
        </Button>
      </header>

      <form className="explore-search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="explore-search" className="visually-hidden">
          Search items
        </label>
        <input
          id="explore-search"
          className="input"
          type="search"
          placeholder="Search, e.g. “black wallet” or “library”"
          value={values.q}
          onChange={(event) => setFilter('q', event.target.value)}
        />
      </form>

      <div className="explore-layout">
        <aside className={`explore-filters ${showFilters ? 'is-open' : ''}`} aria-label="Filters">
          <FilterPanel filters={filters} categories={categories} communities={communities} id="explore-filters" />
        </aside>

        <section className="explore-results" aria-live="polite" aria-busy={results.isLoading}>
          <div className="explore-toolbar">
            <p className="explore-count">{resultsSummary}</p>

            <div className="explore-toolbar-actions">
              <Button
                variant="secondary"
                size="small"
                className="explore-filter-toggle"
                aria-expanded={showFilters}
                aria-controls="explore-filters"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide filters' : `Filters${activeCount ? ` (${activeCount})` : ''}`}
              </Button>

              <label className="explore-sort">
                <span>Sort</span>
                <select className="input" value={values.sort} onChange={(event) => setFilter('sort', event.target.value)}>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </label>
            </div>
          </div>

          {results.error && (
            <EmptyState title="Couldn’t load items" text="Something went wrong. Refresh the page to try again." />
          )}

          {results.data && items.length === 0 && (
            <EmptyState
              title="No items match"
              text="Try fewer words, or remove a filter. If you lost something, report it so the finder can reach you."
            >
              {activeCount > 0 && (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
              <Button to="/report?type=lost" variant="lost">
                Report a lost item
              </Button>
            </EmptyState>
          )}

          {items.length > 0 && (
            <div className={`card-grid ${results.isLoading ? 'is-refreshing' : ''}`}>
              {items.map((item) => (
                <ItemCard key={item.item_id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default ExplorePage
