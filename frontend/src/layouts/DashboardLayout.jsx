import { NavLink, Outlet } from 'react-router-dom'
import '../styles/pages/dashboard.css'

const DASHBOARD_LINKS = [
  { label: 'Overview', path: '/dashboard' },
  { label: 'My lost reports', path: '/dashboard/lost-reports' },
  { label: 'My found reports', path: '/dashboard/found-reports' },
  { label: 'My claims', path: '/dashboard/claims' },
  { label: 'Claim verification', path: '/dashboard/verification' },
  { label: 'Notifications', path: '/dashboard/notifications' },
  { label: 'Profile', path: '/profile' },
]

// Side menu on the left, the dashboard page on the right (stacked on phones)
function DashboardLayout() {
  return (
    <div className="container dashboard">
      <nav className="dashboard-nav" aria-label="Dashboard">
        {DASHBOARD_LINKS.map((link) => (
          <NavLink key={link.path} to={link.path} end={link.path === '/dashboard'}>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  )
}

export default DashboardLayout
