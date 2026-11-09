/*
  Turns a date like "2026-11-02" into "2 Nov 2026".
  Used anywhere we show when an item was lost or found.
*/
export function formatDate(dateText) {
  const date = new Date(dateText)

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
