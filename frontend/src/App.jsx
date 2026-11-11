import { Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import ItemDetailsPage from './pages/ItemDetailsPage'
import ReportPage from './pages/ReportPage'
import MapPage from './pages/MapPage'
import StyleGuidePage from './pages/StyleGuidePage'
import PlaceholderPage from './pages/PlaceholderPage'
import NotFoundPage from './pages/NotFoundPage'

/*
  Every page in Findr and the address (route) it lives at.

  Home and the Phase 2 pages (Explore, Item details, Report, Map) are real.
  The rest are placeholders that say which roadmap stage builds them.
  When a stage is done, swap its placeholder for the real page component.
*/
const PLANNED_PAGES = [
  // Public pages
  { path: '/login', title: 'Log in', stage: '3.1', description: 'Sign in to report items and make claims.' },
  { path: '/signup', title: 'Create an account', stage: '3.1', description: 'Join your college or community on Findr.' },

  // User dashboard
  { path: '/dashboard', title: 'Dashboard', stage: '3.2', description: 'Your reports, claims and updates in one place.' },
  { path: '/dashboard/lost-reports', title: 'My lost reports', stage: '3.2', description: 'Items you reported as lost, with possible matches.' },
  { path: '/dashboard/found-reports', title: 'My found reports', stage: '3.2', description: 'Items you found and the claims they received.' },
  { path: '/dashboard/claims', title: 'My claims', stage: '3.3', description: 'Track every claim you submitted.' },
  { path: '/dashboard/verification', title: 'Claim verification', stage: '3.4', description: 'Review claims on items you found and approve the real owner.' },
  { path: '/dashboard/notifications', title: 'Notifications', stage: '3.5', description: 'Claim decisions and handover updates.' },

  // Account, support and admin
  { path: '/profile', title: 'Your profile', stage: '3.6', description: 'Your name, community and contact details.' },
  { path: '/help', title: 'Help and contact', stage: '3.6', description: 'FAQs, safety tips and a way to reach the team.' },
  { path: '/admin', title: 'Admin dashboard', stage: '3.6', description: 'Moderate reports, users, claims and communities.' },
]

function App() {
  return (
    <Routes>
      {/* MainLayout wraps every page with the navbar and footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/items/:id" element={<ItemDetailsPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/map" element={<MapPage />} />

        {PLANNED_PAGES.map((page) => (
          <Route
            key={page.path}
            path={page.path}
            element={<PlaceholderPage title={page.title} description={page.description} stage={page.stage} />}
          />
        ))}

        {/* A page showing every shared component, for the team to check the design system */}
        <Route path="/style-guide" element={<StyleGuidePage />} />

        {/* Anything else: 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
