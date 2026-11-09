import Button from '../components/Button'
import '../styles/pages/placeholder.css'

// Shown for any address that does not match a route in App.jsx
function NotFoundPage() {
  return (
    <section className="container placeholder-page">
      <span className="badge badge-lost">404</span>
      <h1>This page is lost</h1>
      <p>We looked everywhere, but there is nothing at this address. Maybe someone reported it as found?</p>
      <Button to="/">Back to home</Button>
    </section>
  )
}

export default NotFoundPage
