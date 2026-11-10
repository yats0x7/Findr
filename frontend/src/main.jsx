import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Global styles load before App, so each page's own CSS (imported inside App) can override them
import './styles/index.css'
import App from './App'

// The starting point of the app: React takes over the <div id="root"> in index.html.
// BrowserRouter lets us change pages without reloading the browser.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
