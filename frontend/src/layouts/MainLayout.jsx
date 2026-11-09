import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/*
  The frame around every page: navbar on top, footer at the bottom.
  <Outlet /> is where React Router puts the page you are visiting.
*/
function MainLayout() {
  const location = useLocation()

  // The browser keeps the old scroll position when React swaps pages,
  // so we jump back to the top every time the address changes.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default MainLayout
