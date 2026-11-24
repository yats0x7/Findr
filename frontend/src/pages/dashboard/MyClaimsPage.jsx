import { useState } from 'react'
import Button from '../../components/Button'
import EmptyState from '../../components/EmptyState'
import HandoverPanel from '../../components/HandoverPanel'
import ItemRow from '../../components/ItemRow'
import { useAsync } from '../../hooks/useAsync'
import { listMyClaims, withdrawClaim } from '../../services/claimService'
import { formatDate } from '../../utils/formatDate'
import { claimBadgeStatus } from '../../utils/labels'

const WHAT_HAPPENS_NEXT = {
  PENDING: 'Your answer matched. The finder will look at your claim and approve or reject it.',
  APPROVED: 'The finder approved your claim. Agree a time and place to collect it.',
  REJECTED: "The finder didn't approve this claim.",
  WITHDRAWN: 'You withdrew this claim.',
}

function MyClaimsPage() {
  const [reloadCount, setReloadCount] = useState(0)
  const [message, setMessage] = useState(null)
  const { data, error, isLoading } = useAsync(listMyClaims, [reloadCount])

  async function handleWithdraw(claim) {
    if (!window.confirm(`Withdraw your claim on "${claim.item.title}"?`)) {
      return
    }
    try {
      await withdrawClaim(claim.claim_id)
      setMessage({ type: 'success', text: 'Claim withdrawn.' })
      setReloadCount((count) => count + 1)
    } catch (withdrawError) {
      setMessage({ type: 'error', text: withdrawError.message })
    }
  }

  const claims = data || []

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>My claims</h1>
          <p>Items you said are yours, and what the finder decided.</p>
        </div>
      </header>

      {message && (
        <div className={`alert alert-${message.type}`} role="status">
          {message.text}
        </div>
      )}

      {isLoading && !data && <p className="loading-text">Loading your claims…</p>}
      {error && <div className="alert alert-error">Couldn't load your claims. Refresh to try again.</div>}

      {data && claims.length === 0 && (
        <EmptyState title="No claims yet" text="When you find your lost item in Explore, open it and press Claim.">
          <Button to="/explore?type=found">Look through found items</Button>
        </EmptyState>
      )}

      <div className="item-list">
        {claims.map((claim) => {
          const returned = claimBadgeStatus(claim) === 'RETURNED'
          return (
            <ItemRow key={claim.claim_id} item={claim.item} badges={[claimBadgeStatus(claim)]}>
              <p className="item-row-meta">
                Claimed on {formatDate(claim.created_at)} · Found by {claim.finder_name}
              </p>
              <p className="item-row-note">{returned ? 'You got it back. Nice!' : WHAT_HAPPENS_NEXT[claim.status]}</p>
              {claim.review_note && <p className="item-row-note">Finder's note: "{claim.review_note}"</p>}

              {claim.status === 'APPROVED' && !returned && (
                <HandoverPanel claim={claim} isFinder={false} onChange={() => setReloadCount((count) => count + 1)} />
              )}

              {claim.status === 'PENDING' && (
                <div className="item-row-actions">
                  <Button variant="ghost" size="small" onClick={() => handleWithdraw(claim)}>
                    Withdraw claim
                  </Button>
                </div>
              )}
            </ItemRow>
          )
        })}
      </div>
    </>
  )
}

export default MyClaimsPage
