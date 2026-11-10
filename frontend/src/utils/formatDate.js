/*
  Turns a date like "2026-11-02" into "2 Nov 2026".
  Used anywhere we show when an item was lost or found.

  A plain "YYYY-MM-DD" is read as a local date. new Date("2026-11-02") alone
  would read it as midnight in London, which shows the day before for
  anyone west of it.
*/
export function formatDate(dateText) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateText) ? parseLocalDate(dateText) : new Date(dateText)

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function parseLocalDate(dateText) {
  const [year, month, day] = dateText.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Today as "YYYY-MM-DD" in the user's own time zone, the format date inputs use
export function todayAsDateInput() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
