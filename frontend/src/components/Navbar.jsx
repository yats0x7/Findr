import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import Button from './Button'
import Logo from './Logo'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../hooks/useAuth'
import { countUnread } from '../services/notificationService'

// The main links shown in the navbar, in order.
const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Explore', path: '/explore' },
  { label: 'Map', path: '/map' },
  { label: 'Report', path: '/report' },
  { label: 'Help', path: '/help' },
]

function Navbar() {
  const { user, logOut } = useAuth()
  // On phones the links hide behind a "Menu" button. This remembers if it is open.
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // checked again on every page change, good enough without a real-time connection
  const unread = useAsync(countUnread, [location.pathname, user?.user_id]).data || 0

  // Close the phone menu whenever the user moves to another page
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  async function handleLogOut() {
    await logOut()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <Logo />
          Findr
        </Link>

        <nav className={`navbar-links ${isMenuOpen ? 'is-open' : ''}`} aria-label="Main">
          {NAV_LINKS.map((link) => (
            // `end` makes "Home" active only on "/", not on every page
            <NavLink key={link.path} to={link.path} end={link.path === '/'}>
              {link.label}
            </NavLink>
          ))}
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          {user?.isAdmin && <NavLink to="/admin">Admin</NavLink>}
        </nav>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/dashboard/notifications" className="navbar-bell" aria-label={`Notifications, ${unread} unread`}>
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {unread > 0 && <span className="navbar-bell-count">{unread > 9 ? '9+' : unread}</span>}
              </Link>
              <Link to="/profile" className="navbar-user">
                Hi, {user.full_name.split(' ')[0]}
              </Link>
              <Button variant="ghost" size="small" onClick={handleLogOut}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="small">
                Log in
              </Button>
              <Button to="/signup" size="small" className="navbar-signup">
                Sign up
              </Button>
            </>
          )}

          <Button
            variant="secondary"
            size="small"
            className="navbar-menu-button"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? 'Close' : 'Menu'}
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
