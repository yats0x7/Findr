import { Link } from 'react-router-dom'
import Logo from './Logo'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <Link to="/" className="navbar-brand">
              <Logo size={28} />
              Findr
            </Link>
            <p>Lost and found for colleges, hostels and residential communities.</p>
          </div>

          <nav className="footer-links" aria-label="Footer">
            <Link to="/explore">Explore items</Link>
            <Link to="/map">Map</Link>
            <Link to="/report">Report an item</Link>
            <Link to="/help">Help and safety</Link>
          </nav>
        </div>

        <p className="footer-bottom">© {currentYear} Findr</p>
      </div>
    </footer>
  )
}

export default Footer
