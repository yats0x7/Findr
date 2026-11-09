/*
  A small coloured label for statuses.

  We keep one list of every status Findr uses, with its colour and the
  words people see. That way "Returned" looks the same on every page.
*/
const BADGE_STYLES = {
  LOST: { colour: 'lost', label: 'Lost' },
  FOUND: { colour: 'found', label: 'Found' },
  OPEN: { colour: 'info', label: 'Open' },
  CLAIM_PENDING: { colour: 'pending', label: 'Claim pending' },
  CLAIM_APPROVED: { colour: 'found', label: 'Claim approved' },
  RETURNED: { colour: 'returned', label: 'Returned' },
  CLOSED: { colour: 'neutral', label: 'Closed' },
}

function Badge({ status }) {
  // Unknown statuses still render, just in grey with the raw text
  const style = BADGE_STYLES[status] || { colour: 'neutral', label: status }

  return <span className={`badge badge-${style.colour}`}>{style.label}</span>
}

export default Badge
