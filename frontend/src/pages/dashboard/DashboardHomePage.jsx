import { Link } from 'react-router-dom'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../hooks/useAuth'
import { listMyClaims } from '../../services/claimService'
import { listMyReports } from '../../services/itemService'
import { claimBadgeStatus } from '../../utils/labels'

function DashboardHomePage() {
  const { user } = useAuth()
  const { data, error, isLoading } = useAsync(
    () => Promise.all([listMyReports('LOST'), listMyReports('FOUND'), listMyClaims()]),
    [],
  )

  if (isLoading && !data) {
    return <p className="loading-text">Loading your dashboard…</p>
  }
  if (error) {
    return <div className="alert alert-error">Couldn't load your dashboard. Refresh to try again.</div>
  }

  const [lostReports, foundReports, claims] = data
  const stillOpen = (item) => ['OPEN', 'CLAIM_PENDING'].includes(item.status)

  const foundWithClaims = foundReports.filter((item) => item.pending_claims > 0)
  const waitingClaims = claims.filter((claim) => claim.status === 'PENDING')
  const approvedClaims = claims.filter((claim) => claim.status === 'APPROVED' && claim.item.status !== 'RETURNED')

  const stats = [
    { label: 'Lost reports still open', value: lostReports.filter(stillOpen).length, path: '/dashboard/lost-reports' },
    { label: 'Found reports', value: foundReports.length, path: '/dashboard/found-reports' },
    {
      label: 'Claims waiting for you',
      value: foundReports.reduce((total, item) => total + item.pending_claims, 0),
      path: '/dashboard/verification',
    },
    { label: 'Your claims in progress', value: waitingClaims.length + approvedClaims.length, path: '/dashboard/claims' },
  ]

  const nothingToDo = foundWithClaims.length === 0 && approvedClaims.length === 0

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Hi, {user.full_name.split(' ')[0]}</h1>
          <p>Everything you reported and claimed on Findr.</p>
        </div>
        <div className="dashboard-header-actions">
          <Button to="/report?type=lost" variant="lost">
            I lost something
          </Button>
          <Button to="/report?type=found" variant="found">
            I found something
          </Button>
        </div>
      </header>

      <div className="stat-grid">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.path} className="stat-card">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </Link>
        ))}
      </div>

      <section className="dashboard-section">
        <h2>Needs your attention</h2>

        {nothingToDo ? (
          <p className="dashboard-muted">Nothing right now. We'll show claims and handovers here when they need you.</p>
        ) : (
          <ul className="attention-list">
            {foundWithClaims.map((item) => (
              <li key={item.item_id}>
                <span>
                  <strong>{item.title}</strong> has {item.pending_claims} claim{item.pending_claims > 1 ? 's' : ''} waiting
                  for your decision.
                </span>
                <Link to={`/dashboard/verification?item=${item.item_id}`}>Review</Link>
              </li>
            ))}
            {approvedClaims.map((claim) => (
              <li key={claim.claim_id}>
                <span>
                  Your claim on <strong>{claim.item.title}</strong> was approved.{' '}
                  {claim.handover?.status === 'SCHEDULED' ? 'The handover is set.' : 'Time to arrange the handover.'}
                </span>
                <Link to="/dashboard/claims">{claim.handover?.status === 'SCHEDULED' ? 'See details' : 'Arrange it'}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>Your latest claims</h2>
          <Link to="/dashboard/claims">All claims →</Link>
        </div>

        {claims.length === 0 ? (
          <p className="dashboard-muted">
            You haven't claimed anything yet. If you lost something, <Link to="/explore?type=found">look through the found items</Link>.
          </p>
        ) : (
          <ul className="simple-list">
            {claims.slice(0, 3).map((claim) => (
              <li key={claim.claim_id}>
                <Link to={`/items/${claim.item_id}`}>{claim.item.title}</Link>
                <Badge status={claimBadgeStatus(claim)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default DashboardHomePage
