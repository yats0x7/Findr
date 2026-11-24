import { useState } from 'react'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import ItemRow from '../../components/ItemRow'
import { useAsync } from '../../hooks/useAsync'
import { closeItem, listMyReports } from '../../services/itemService'

function claimSummary(item) {
  if (item.total_claims === 0) {
    return 'No claims yet.'
  }
  if (item.pending_claims === 0) {
    return `${item.total_claims} claim${item.total_claims > 1 ? 's' : ''}, none waiting.`
  }
  return `${item.pending_claims} claim${item.pending_claims > 1 ? 's' : ''} waiting for your decision.`
}

function MyFoundReportsPage() {
  const [reloadCount, setReloadCount] = useState(0)
  const [message, setMessage] = useState(null)
  const { data, error, isLoading } = useAsync(() => listMyReports('FOUND'), [reloadCount])

  async function handleClose(item) {
    const warning =
      item.pending_claims > 0 ? ' The claims waiting on it will be closed too.' : ''
    if (!window.confirm(`Close "${item.title}"? It will stop taking claims.${warning}`)) {
      return
    }
    try {
      await closeItem(item.item_id)
      setMessage({ type: 'success', text: `Closed "${item.title}".` })
      setReloadCount((count) => count + 1)
    } catch (closeError) {
      setMessage({ type: 'error', text: closeError.message })
    }
  }

  const reports = data || []

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>My found reports</h1>
          <p>Things you found, and the claims people made on them.</p>
        </div>
        <Button to="/report?type=found" variant="found">
          Report a found item
        </Button>
      </header>

      {message && (
        <div className={`alert alert-${message.type}`} role="status">
          {message.text}
        </div>
      )}

      {isLoading && !data && <p className="loading-text">Loading your reports…</p>}
      {error && <div className="alert alert-error">Couldn't load your reports. Refresh to try again.</div>}

      {data && reports.length === 0 && (
        <EmptyState title="No found reports" text="Found something? Report it and set a question only the owner can answer.">
          <Button to="/report?type=found" variant="found">
            Report a found item
          </Button>
        </EmptyState>
      )}

      <div className="item-list">
        {reports.map((item) => {
          const isOpen = ['OPEN', 'CLAIM_PENDING'].includes(item.status)
          return (
            <ItemRow key={item.item_id} item={item}>
              <p className={`item-row-note ${item.pending_claims > 0 ? 'is-highlighted' : ''}`}>{claimSummary(item)}</p>
              <div className="item-row-actions">
                {item.total_claims > 0 && (
                  <Button to={`/dashboard/verification?item=${item.item_id}`} size="small">
                    {item.pending_claims > 0 ? 'Review claims' : 'See claims'}
                  </Button>
                )}
                {isOpen && (
                  <Button to={`/dashboard/reports/${item.item_id}/edit`} variant="secondary" size="small">
                    Edit
                  </Button>
                )}
                {isOpen && (
                  <Button variant="ghost" size="small" onClick={() => handleClose(item)}>
                    Close report
                  </Button>
                )}
              </div>
            </ItemRow>
          )
        })}
      </div>
    </>
  )
}

export default MyFoundReportsPage
