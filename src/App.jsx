import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Bins from './pages/Bins'
import BinDetail from './pages/BinDetail'
import RoutesPage from './pages/Routes'
import Analytics from './pages/Analytics'
import Alerts from './pages/Alerts'
import Telemetry from './pages/Telemetry'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#05080f' }}>
        <Navbar />
        <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/fleet"       element={<Bins />} />
            <Route path="/fleet/:id"   element={<BinDetail />} />
            <Route path="/routes"      element={<RoutesPage />} />
            <Route path="/analytics"   element={<Analytics />} />
            <Route path="/alerts"      element={<Alerts />} />
            <Route path="/telemetry"   element={<Telemetry />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
