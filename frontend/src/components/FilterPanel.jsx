import { STATUS_OPTIONS } from '../hooks/useItemFilters'

/*
  The filters shared by Explore and Map.

  It only draws the controls. The values live in the URL and come from
  useItemFilters(), which the page passes in as `filters`.

  layout: 'sidebar' (Explore, a column beside the results)
          'bar'     (Map, a row of controls above the map)
*/
const TYPE_CHOICES = [
  { value: '', label: 'All' },
  { value: 'lost', label: 'Lost' },
  { value: 'found', label: 'Found' },
]

function FilterPanel({ filters, categories, communities, layout = 'sidebar', id }) {
  const { values, setFilter, clearFilters, activeCount } = filters

  // Every input needs a unique id for its label. Explore and Map never show together, but be safe.
  const fieldId = (name) => `${id}-${name}`

  return (
    <div className={`filter-panel filter-panel-${layout}`} id={id}>
      <fieldset className="field filter-type">
        <legend className="field-label">Type</legend>
        <div className="segmented">
          {TYPE_CHOICES.map((choice) => (
            <label key={choice.label} className={`segmented-option ${values.type === choice.value ? 'is-selected' : ''}`}>
              <input
                type="radio"
                name={fieldId('type')}
                value={choice.value}
                checked={values.type === choice.value}
                onChange={() => setFilter('type', choice.value)}
              />
              {choice.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label className="field-label" htmlFor={fieldId('category')}>
          Category
        </label>
        <select
          id={fieldId('category')}
          className="input"
          value={values.category}
          onChange={(event) => setFilter('category', event.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.category_id} value={category.category_id}>
              {category.category_name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field-label" htmlFor={fieldId('community')}>
          Community
        </label>
        <select
          id={fieldId('community')}
          className="input"
          value={values.community}
          onChange={(event) => setFilter('community', event.target.value)}
        >
          <option value="">All communities</option>
          {communities.map((community) => (
            <option key={community.community_id} value={community.community_id}>
              {community.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field-label" htmlFor={fieldId('status')}>
          Status
        </label>
        <select
          id={fieldId('status')}
          className="input"
          value={values.status}
          onChange={(event) => setFilter('status', event.target.value)}
        >
          <option value="">Any status</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field-label" htmlFor={fieldId('location')}>
          Location
        </label>
        <input
          id={fieldId('location')}
          className="input"
          type="search"
          placeholder="e.g. Library"
          value={values.location}
          onChange={(event) => setFilter('location', event.target.value)}
        />
      </div>

      <fieldset className="field filter-dates">
        <legend className="field-label">Date lost or found</legend>
        <div className="filter-date-inputs">
          <label className="visually-hidden" htmlFor={fieldId('from')}>
            From
          </label>
          <input
            id={fieldId('from')}
            className="input"
            type="date"
            value={values.from}
            max={values.to || undefined}
            onChange={(event) => setFilter('from', event.target.value)}
          />
          <span aria-hidden="true">to</span>
          <label className="visually-hidden" htmlFor={fieldId('to')}>
            To
          </label>
          <input
            id={fieldId('to')}
            className="input"
            type="date"
            value={values.to}
            min={values.from || undefined}
            onChange={(event) => setFilter('to', event.target.value)}
          />
        </div>
      </fieldset>

      {activeCount > 0 && (
        <button type="button" className="filter-clear" onClick={clearFilters}>
          Clear all filters
        </button>
      )}
    </div>
  )
}

export default FilterPanel
