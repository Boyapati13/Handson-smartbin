import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navbar    from './components/Navbar'
import Topbar    from './components/Topbar'
import ToastContainer from './components/Toast'
import Dashboard from './pages/Dashboard'
import Bins      from './pages/Bins'
import BinDetail from './pages/BinDetail'
import RoutesPage from './pages/Routes'
import Analytics from './pages/Analytics'
import Alerts    from './pages/Alerts'
import Reports       from './pages/Reports'
import Maintenance   from './pages/Maintenance'
import PublicReport  from './pages/PublicReport'
import Telemetry     from './pages/Telemetry'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public access — no sidebar, no auth */}
        <Route path="/public-report" element={<PublicReport />} />

        {/* Staff portal — full app shell */}
        <Route path="/*" element={
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
                    <Route path="/maintenance"  element={<Maintenance />} />
                    <Route path="/reports"      element={<Reports />} />
                    <Route path="/telemetry"    element={<Telemetry />} />
                  </Routes>
                </main>
              </div>
            </div>
            <ToastContainer />
          </AppProvider>
        }/>
      </Routes>
    </BrowserRouter>
  )
}
