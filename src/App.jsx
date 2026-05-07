import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import Lenis from 'lenis'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FeaturedCollection from './components/FeaturedCollection'
import Collections from './components/Collections'
import Footer from './components/Footer'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Contact from './pages/Contact'
import Auth from './pages/Auth'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminRoute from './components/AdminRoute'
import ScrollToTop from './components/ScrollToTop'
import WhatsAppButton from './components/WhatsAppButton'
import CustomCursor from './components/CustomCursor'

/** Keeps pointer + caret usable on auth/admin while CustomCursor is hidden outside storefront chrome. */
function NativeCursorSync() {
  const { pathname } = useLocation()

  useEffect(() => {
    const root = document.documentElement
    const useNativeCursor = pathname === '/auth' || pathname.startsWith('/admin')
    if (useNativeCursor) {
      root.classList.add('native-cursor')
    } else {
      root.classList.remove('native-cursor')
    }
  }, [pathname])

  return null
}

function LenisScroll() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname === '/auth') {
      return undefined
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    let rafId = 0
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [pathname])

  return null
}

const Home = () => (
  <>
    <Hero />
    <Collections />
    <FeaturedCollection />
  </>
)

function MainLayout() {
  const location = useLocation()
  const hideCustomCursor = location.pathname === '/auth'

  return (
    <>
      {!hideCustomCursor && <CustomCursor />}
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <NativeCursorSync />
      <LenisScroll />
      <div className="bg-white min-h-screen text-dark font-sans selection:bg-dark selection:text-white relative">
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
          </Route>
        </Routes>
      </div>
      <Toaster
        position="top-center"
        closeButton
        richColors
        toastOptions={{
          classNames: {
            toast:
              'rounded-2xl border border-dark/10 bg-white text-dark shadow-[0_16px_48px_-24px_rgba(18,18,18,0.35)] font-sans',
            title: 'font-semibold text-dark',
            description: 'text-dark/55 text-sm font-light',
            actionButton: '!bg-dark !text-white !rounded-full',
            cancelButton: '!rounded-full',
            closeButton: '!bg-dark/5',
          },
        }}
      />
    </Router>
  )
}

export default App
