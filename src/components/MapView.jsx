import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import { statusMap, fillColor } from '../data/bins'

// Fix default icon paths that Vite can break
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function FitBounds({ bins }) {
  const map = useMap()
  useEffect(() => {
    if (!bins.length) return
    const coords = bins.map(b => [b.lat, b.lng])
    map.fitBounds(coords, { padding: [40, 40] })
  }, [map, bins])
  return null
}

export default function MapView({ bins, height = 280 }) {
  const maltaCenter = [35.895, 14.445]

  return (
    <div style={{ height, width: '100%', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}>
      <MapContainer
        center={maltaCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />
        <FitBounds bins={bins} />
        {bins.map(bin => {
          const color = statusMap[bin.status]?.color ?? '#475569'
          const fc    = fillColor(bin.fill)
          return (
            <CircleMarker
              key={bin.id}
              center={[bin.lat, bin.lng]}
              radius={bin.status === 'offline' ? 7 : 9}
              fillColor={color}
              fillOpacity={0.92}
              color={bin.status === 'offline' ? 'transparent' : 'rgba(255,255,255,0.25)'}
              weight={2}
              eventHandlers={{
                mouseover: e => e.target.setRadius(13),
                mouseout:  e => e.target.setRadius(bin.status === 'offline' ? 7 : 9),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                <div style={{ minWidth: 160 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4, color: '#f0f6ff' }}>{bin.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ color: '#4d6585', fontSize: '0.75rem' }}>Fill</span>
                    <span style={{ color: fc, fontWeight: 600, fontFamily: 'IBM Plex Mono,monospace', fontSize: '0.78rem' }}>{bin.fill}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ color: '#4d6585', fontSize: '0.75rem' }}>Status</span>
                    <span style={{ color, fontWeight: 600, fontSize: '0.78rem' }}>{bin.status}</span>
                  </div>
                  {bin.battery > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                      <span style={{ color: '#4d6585', fontSize: '0.75rem' }}>Battery</span>
                      <span style={{ color: bin.battery < 20 ? '#ef4444' : '#4d6585', fontFamily: 'IBM Plex Mono,monospace', fontSize: '0.78rem' }}>{bin.battery}%</span>
                    </div>
                  )}
                  <div style={{ marginTop: 6, fontSize: '0.68rem', color: '#2d4060', fontFamily: 'IBM Plex Mono,monospace' }}>{bin.id} · {bin.area}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
