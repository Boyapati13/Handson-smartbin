import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Navbar    from './components/Navbar'
import Topbar    from './components/Topbar'
import ToastContainer from './components/Toast'
import ChatBot   from './components/ChatBot'

const Landing     = lazy(() => import('./pages/Landing'))
const Dashboard   = lazy(() => import('./pages/Dashboard'))
const Bins        = lazy(() => import('./pages/Bins'))
const BinDetail   = lazy(() => import('./pages/BinDetail'))
const RoutesPage  = lazy(() => import('./pages/Routes'))
const Analytics   = lazy(() => import('./pages/Analytics'))
const Alerts      = lazy(() => import('./pages/Alerts'))
const Reports     = lazy(() => import('./pages/Reports'))
const Maintenance = lazy(() => import('./pages/Maintenance'))
const PublicReport= lazy(() => import('./pages/PublicReport'))
const DeviceMonitor=lazy(() => import('./pages/DeviceMonitor'))
const Telemetry   = lazy(() => import('./pages/Telemetry'))

function Fallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--sub)', fontSize: '0.9rem' }}>
      Loading…
    </div>
  )
}

function AppShell() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/" replace />

  return (
    <AppProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--ink)' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <Topbar />
          <main style={{ flex: 1, overflowY: 'auto' }}>
            <Routes>
              <Route path="/"             element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"    element={<Dashboard />} />
              <Route path="/fleet"        element={<Bins />} />
              <Route path="/fleet/:id"    element={<BinDetail />} />
              <Route path="/routes"       element={<RoutesPage />} />
              <Route path="/analytics"    element={<Analytics />} />
              <Route path="/alerts"       element={<Alerts />} />
              <Route path="/device"       element={<DeviceMonitor />} />
              <Route path="/maintenance"  element={<Maintenance />} />
              <Route path="/reports"      element={<Reports />} />
              <Route path="/telemetry"    element={<Telemetry />} />
            </Routes>
          </main>
        </div>
      </div>
      <ToastContainer />
      <ChatBot />
    </AppProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Fallback />}>
          <Routes>
            <Route path="/public-report" element={<PublicReport />} />
            <Route path="/"              element={<LandingOrRedirect />} />
            <Route path="/*"             element={<AppShell />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

function LandingOrRedirect() {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : <Landing />
}
