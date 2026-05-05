import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Bins from './pages/Bins'
import BinDetail from './pages/BinDetail'
import RoutesPage from './pages/Routes'
import Analytics from './pages/Analytics'
import Specifications from './pages/Specifications'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bins" element={<Bins />} />
        <Route path="/bins/:id" element={<BinDetail />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/specifications" element={<Specifications />} />
      </Routes>
    </BrowserRouter>
  )
}
