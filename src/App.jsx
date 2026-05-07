import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FeaturedCollection from './components/FeaturedCollection'
import Collections from './components/Collections'
import Footer from './components/Footer'
import AdminRoute from './components/AdminRoute'
import ScrollToTop from './components/ScrollToTop'
import WhatsAppButton from './components/WhatsAppButton'
import CustomCursor from './components/CustomCursor'
import PageLoader from './components/PageLoader'

const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Contact = lazy(() => import('./pages/Contact'))
const Auth = lazy(() => import('./pages/Auth'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

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

    let cancelled = false
    let rafId = 0
    let lenisInstance = null

    ;(async () => {
      const { default: Lenis } = await import('lenis')
      if (cancelled) return

      lenisInstance = new Lenis({
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

      function raf(time) {
        lenisInstance?.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
    })()

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      lenisInstance?.destroy()
      lenisInstance = null
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
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
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
