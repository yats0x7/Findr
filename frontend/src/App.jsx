import { Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import AdminLayout from './layouts/AdminLayout'
import RequireLogin from './routes/RequireLogin'
import RequireAdmin from './routes/RequireAdmin'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import ItemDetailsPage from './pages/ItemDetailsPage'
import ReportPage from './pages/ReportPage'
import MapPage from './pages/MapPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ClaimPage from './pages/ClaimPage'
import HelpPage from './pages/HelpPage'
import ProfilePage from './pages/ProfilePage'
import DashboardHomePage from './pages/dashboard/DashboardHomePage'
import MyLostReportsPage from './pages/dashboard/MyLostReportsPage'
import MyFoundReportsPage from './pages/dashboard/MyFoundReportsPage'
import MyClaimsPage from './pages/dashboard/MyClaimsPage'
import EditReportPage from './pages/dashboard/EditReportPage'
import VerificationPage from './pages/dashboard/VerificationPage'
import NotificationsPage from './pages/dashboard/NotificationsPage'
import AdminOverviewPage from './pages/admin/AdminOverviewPage'
import AdminMembersPage from './pages/admin/AdminMembersPage'
import AdminReportsPage from './pages/admin/AdminReportsPage'
import AdminClaimsPage from './pages/admin/AdminClaimsPage'
import StyleGuidePage from './pages/StyleGuidePage'
import NotFoundPage from './pages/NotFoundPage'

/*
  Every page in Findr and the address (route) it lives at.

  Pages inside <RequireLogin> need an account: guests get sent to /login
  and come back after. Pages inside <RequireAdmin> are for community admins only.
*/
function App() {
  return (
    <Routes>
      {/* MainLayout wraps every page with the navbar and footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/items/:id" element={<ItemDetailsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/help" element={<HelpPage />} />

        <Route element={<RequireLogin />}>
          <Route path="/report" element={<ReportPage />} />
          <Route path="/items/:id/claim" element={<ClaimPage />} />

          {/* dashboard pages share the side menu */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHomePage />} />
            <Route path="/dashboard/lost-reports" element={<MyLostReportsPage />} />
            <Route path="/dashboard/found-reports" element={<MyFoundReportsPage />} />
            <Route path="/dashboard/claims" element={<MyClaimsPage />} />
            <Route path="/dashboard/verification" element={<VerificationPage />} />
            <Route path="/dashboard/notifications" element={<NotificationsPage />} />
            <Route path="/dashboard/reports/:id/edit" element={<EditReportPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminOverviewPage />} />
            <Route path="/admin/members" element={<AdminMembersPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/claims" element={<AdminClaimsPage />} />
          </Route>
        </Route>

        {/* A page showing every shared component, for the team to check the design system */}
        <Route path="/style-guide" element={<StyleGuidePage />} />

        {/* Anything else: 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
