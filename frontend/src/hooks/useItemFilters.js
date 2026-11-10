import { useSearchParams } from 'react-router-dom'

/*
  Explore and Map keep their filters in the address bar, for example
    /explore?type=found&category=electronics&q=charger
  so a filtered list can be shared, bookmarked, and survives a reload.

  This hook reads those values, cleans them up, and turns them into the
  filters itemService.listItems() understands.
*/

// Short, readable words in the URL, mapped to the codes stored in the database
const TYPE_FROM_URL = { lost: 'LOST', found: 'FOUND' }
const STATUS_FROM_URL = {
  open: 'OPEN',
  'claim-pending': 'CLAIM_PENDING',
  'claim-approved': 'CLAIM_APPROVED',
  returned: 'RETURNED',
  closed: 'CLOSED',
}
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'claim-pending', label: 'Claim pending' },
  { value: 'claim-approved', label: 'Claim approved' },
  { value: 'returned', label: 'Returned' },
  { value: 'closed', label: 'Closed' },
]

// The filters counted on the "Filters (3)" button. Search and sort are shown separately.
const COUNTED_FILTERS = ['type', 'category', 'community', 'status', 'from', 'to', 'location']

function readValues(searchParams) {
  const value = (key) => searchParams.get(key) || ''

  return {
    q: value('q'),
    // Values that aren't real options are ignored, so a broken link shows everything instead of nothing
    type: TYPE_FROM_URL[value('type')] ? value('type') : '',
    category: value('category'),
    community: value('community'),
    status: STATUS_FROM_URL[value('status')] ? value('status') : '',
    from: DATE_PATTERN.test(value('from')) ? value('from') : '',
    to: DATE_PATTERN.test(value('to')) ? value('to') : '',
    location: value('location'),
    sort: value('sort') === 'oldest' ? 'oldest' : 'newest',
  }
}

export function useItemFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const values = readValues(searchParams)

  // Change one filter. An empty value removes it from the URL.
  // `replace` stops every keystroke in the search box from adding a Back-button step.
  function setFilter(key, newValue) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (newValue && !(key === 'sort' && newValue === 'newest')) {
          next.set(key, newValue)
        } else {
          next.delete(key)
        }
        return next
      },
      { replace: true },
    )
  }

  // Clears the filters but keeps what was typed in the search box and the sort order
  function clearFilters() {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        COUNTED_FILTERS.forEach((key) => next.delete(key))
        return next
      },
      { replace: true },
    )
  }

  const serviceFilters = {
    search: values.q.trim(),
    reportType: TYPE_FROM_URL[values.type] || '',
    categoryId: values.category,
    communityId: values.community,
    status: STATUS_FROM_URL[values.status] || '',
    dateFrom: values.from,
    dateTo: values.to,
    location: values.location.trim(),
    sort: values.sort,
  }

  return {
    values,
    setFilter,
    clearFilters,
    serviceFilters,
    activeCount: COUNTED_FILTERS.filter((key) => values[key]).length,
    hasAnyFilter: COUNTED_FILTERS.some((key) => values[key]) || Boolean(values.q),
    // The current filters as "type=found&q=charger", for links between Explore and Map
    queryString: searchParams.toString(),
  }
}
