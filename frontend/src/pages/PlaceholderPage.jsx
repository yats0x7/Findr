import Button from '../components/Button'
import '../styles/pages/placeholder.css'

/*
  A stand-in for pages that are planned but not built yet.

  Every route in the app exists from Phase 1, so links never break.
  Each placeholder says which roadmap stage will build the real page,
  which makes it easy for the team to see what is coming next.
*/
function PlaceholderPage({ title, description, stage }) {
  return (
    <section className="container placeholder-page">
      <span className="badge badge-info">Coming in Stage {stage}</span>
      <h1>{title}</h1>
      <p>{description}</p>
      <Button to="/" variant="secondary">
        Back to home
      </Button>
    </section>
  )
}

export default PlaceholderPage
