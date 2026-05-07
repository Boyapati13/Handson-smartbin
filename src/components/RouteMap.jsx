import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { statusMap, fillColor } from '../data/bins'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function hasCoords(bin) {
  return bin && bin.lat != null && bin.lng != null &&
         Number.isFinite(bin.lat) && Number.isFinite(bin.lng);
}

function FitRoute({ route, allBins }) {
  const map = useMap()
  useEffect(() => {
    const source = route.length > 0 ? route : allBins
    const coords = source.filter(hasCoords).map(b => [b.lat, b.lng])
    if (!coords.length) return
    try { map.fitBounds(coords, { padding: [40, 40] }) } catch {}
  }, [map, route, allBins])
  return null
}

export default function RouteMap({ route = [], allBins = [], height = 340 }) {
  const defaultCenter = [35.895, 14.445]
  const validRoute    = route.filter(hasCoords)
  const validAll      = allBins.filter(hasCoords)
  const routeCoords   = validRoute.map(b => [b.lat, b.lng])
  const noGPS         = allBins.length > 0 && validAll.length === 0

  return (
    <div style={{ height, width: '100%', borderRadius: '0 0 12px 12px', overflow: 'hidden', position: 'relative' }}>
      {noGPS && (
        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)', borderRadius: 8, padding: '6px 14px', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.65rem', color: '#94a3b8' }}>Awaiting GPS fix from device (frame 0x10)</span>
        </div>
      )}
      <MapContainer center={defaultCenter} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        <FitRoute route={validRoute} allBins={validAll} />

        {routeCoords.length > 1 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: '#29ABE2', weight: 3, dashArray: '8 5', opacity: 0.85 }}
          />
        )}

        {validAll.map(bin => {
          const inRoute = validRoute.some(r => r.id === bin.id)
          const color   = inRoute ? (statusMap[bin.status]?.color ?? '#475569') : '#cbd5e1'
          const order   = validRoute.findIndex(r => r.id === bin.id) + 1
          return (
            <CircleMarker
              key={bin.id}
              center={[bin.lat, bin.lng]}
              radius={inRoute ? 10 : 6}
              fillColor={color}
              fillOpacity={inRoute ? 0.95 : 0.4}
              color={inRoute ? 'rgba(255,255,255,0.4)' : 'transparent'}
              weight={2}
              eventHandlers={{
                mouseover: e => e.target.setRadius(inRoute ? 14 : 8),
                mouseout:  e => e.target.setRadius(inRoute ? 10 : 6),
              }}
            >
              <Tooltip direction="top" offset={[0, -12]}>
                <div style={{ minWidth: 160 }}>
                  {inRoute && (
                    <div style={{ fontSize: '0.68rem', color: '#29ABE2', fontWeight: 700, marginBottom: 4, fontFamily: 'IBM Plex Mono, monospace' }}>
                      STOP #{order}
                    </div>
                  )}
                  <div style={{ fontWeight: 700, marginBottom: 4, color: '#0f172a' }}>{bin.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Fill</span>
                    <span style={{ color: fillColor(bin.fill), fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.78rem' }}>{Math.round(bin.fill)}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Status</span>
                    <span style={{ color, fontWeight: 600, fontSize: '0.75rem' }}>{bin.status}</span>
                  </div>
                  {!inRoute && <div style={{ marginTop: 4, fontSize: '0.68rem', color: '#94a3b8' }}>Not in this route</div>}
                </div>
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
