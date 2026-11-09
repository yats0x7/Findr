import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Button from './Button'
import Logo from './Logo'

// The main links shown in the navbar, in order.
const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Explore', path: '/explore' },
  { label: 'Map', path: '/map' },
  { label: 'Report', path: '/report' },
  { label: 'Help', path: '/help' },
]

function Navbar() {
  // On phones the links hide behind a "Menu" button. This remembers if it is open.
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  // Close the phone menu whenever the user moves to another page
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

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
        </nav>

        <div className="navbar-actions">
          {/* Login is simulated later, in Stage 3.1. For now these just open the pages. */}
          <Button to="/login" variant="ghost" size="small">
            Log in
          </Button>
          <Button to="/signup" size="small" className="navbar-signup">
            Sign up
          </Button>

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
