import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Send, MapPin, Clock, Fuel, Leaf, TrendingDown, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { fillColor } from '../data/bins'
import { computeRouteMetrics, formatDuration, hasValidCoords } from '../utils/routing'
import FillBar    from '../components/FillBar'
import StatusBadge from '../components/StatusBadge'
import RouteMap   from '../components/RouteMap'

const card  = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow)' }
const mono  = { fontFamily: 'IBM Plex Mono, monospace' }
const label = { fontSize: '0.63rem', ...mono, color: 'var(--muted)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }

export default function Routes() {
  const { bins, sendCommand, addToast } = useApp()
  const [threshold,   setThreshold]   = useState(80)
  const [dispatched,  setDispatched]  = useState(false)
  const [dispatchedAt, setDispatchedAt] = useState(null)

  const noGPSAnywhere = bins.every(b => !hasValidCoords(b))

  // Bins eligible for collection — must have GPS, be above threshold and operational
  const eligible = useMemo(
    () => bins.filter(b =>
      hasValidCoords(b) &&
      b.fill >= threshold &&
      b.status !== 'offline' &&
      b.status !== 'fault'
    ),
    [bins, threshold]
  )

  // Compute optimised route + real metrics
  const metrics = useMemo(
    () => computeRouteMetrics(eligible, bins),
    [eligible, bins]
  )

  function handleDispatch() {
    if (!metrics) return
    setDispatched(true)
    setDispatchedAt(new Date())
    // Trigger compaction on each bin in the route
    metrics.route.forEach((bin, i) => {
      setTimeout(() => sendCommand('compact', bin.id), i * 3000)
    })
    addToast(`Route dispatched — ${metrics.stops} stops · ${metrics.distance.toFixed(1)} km`, 'success', 8000)
  }

  return (
    <div style={{ padding: '28px 32px', animation: 'slideUp 0.3s ease both' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.65rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Route Planner
        </h1>
        <div style={{ ...mono, fontSize: '0.7rem', color: 'var(--sub)' }}>
          Nearest-neighbour optimisation · live fill data · {bins.filter(b=>b.status!=='offline').length} units active
        </div>
      </div>

      {/* No GPS warning — device hasn't sent position frame yet */}
      {noGPSAnywhere && (
        <div style={{ ...card, padding: '14px 18px', marginBottom: 20, borderColor: 'rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <MapPin size={16} color="var(--amber)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.82rem', color: 'var(--sub)' }}>
            No GPS coordinates received yet. Route planning activates once the device sends a location frame (E9 10).
            <span style={{ ...mono, fontSize: '0.72rem', color: 'var(--muted)', marginLeft: 8 }}>Demo mode shows full Malta routes.</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ ...card, padding: '22px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={label}>Collection threshold</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <input
                type="range" min={50} max={95} value={threshold}
                onChange={e => { setThreshold(+e.target.value); setDispatched(false) }}
                aria-label={`Collection threshold: ${threshold}%`}
                style={{ flex: 1 }}
              />
              <span style={{ ...mono, fontSize: '1.8rem', fontWeight: 700, color: 'var(--blue)', minWidth: 60 }}>{threshold}%</span>
            </div>

            {/* Computed metrics row */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[
                { Icon: MapPin,       val: metrics ? `${metrics.stops}`                    : '—', sub: 'stops',        color: 'var(--blue)'   },
                { Icon: TrendingDown, val: metrics ? `${metrics.distance.toFixed(1)} km`   : '—', sub: 'route distance', color: 'var(--blue)'  },
                { Icon: Clock,        val: metrics ? formatDuration(metrics.totalMin)       : '—', sub: 'est. time',    color: 'var(--sky)'    },
                { Icon: Leaf,         val: metrics ? `${metrics.co2kg} kg`                 : '—', sub: 'CO₂',          color: 'var(--green)'  },
                { Icon: Fuel,         val: metrics ? `€${metrics.fuelEur}`                 : '—', sub: 'fuel cost',    color: 'var(--amber)'  },
                { Icon: TrendingDown, val: metrics ? `${metrics.savingsPct}%`               : '—', sub: 'vs fixed run', color: metrics?.savingsPct > 0 ? 'var(--green)' : 'var(--muted)' },
              ].map(({ Icon, val, sub, color }) => (
                <div key={sub} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--ink)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <Icon size={13} color={color} />
                  </div>
                  <div>
                    <div style={{ ...mono, fontSize: '1.05rem', fontWeight: 700, color, lineHeight: 1.1 }}>{val || '—'}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: 2 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dispatch button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <button
              onClick={handleDispatch}
              disabled={!metrics || dispatched}
              style={{
                background: dispatched ? 'var(--green)' : metrics ? 'var(--blue)' : 'var(--raised)',
                color: metrics ? '#fff' : 'var(--muted)',
                fontWeight: 700, fontSize: '0.85rem', fontFamily: 'Figtree, sans-serif',
                padding: '12px 28px', borderRadius: 10, border: 'none',
                cursor: metrics && !dispatched ? 'pointer' : 'default',
                whiteSpace: 'nowrap', transition: 'all 0.2s',
                boxShadow: metrics && !dispatched ? '0 4px 14px rgba(41,171,226,0.35)' : 'none',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={e => { if (metrics && !dispatched) e.currentTarget.style.boxShadow = '0 6px 20px rgba(41,171,226,0.5)' }}
              onMouseLeave={e => { if (metrics && !dispatched) e.currentTarget.style.boxShadow = '0 4px 14px rgba(41,171,226,0.35)' }}>
              <Send size={15} strokeWidth={2.5} />
              {dispatched ? 'Dispatched' : 'Dispatch Route'}
            </button>
            {dispatched && dispatchedAt && (
              <div style={{ ...mono, fontSize: '0.65rem', color: 'var(--green)' }}>
                {dispatchedAt.toLocaleTimeString('en-MT', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            {!metrics && (
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textAlign: 'right' }}>
                No bins above {threshold}%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map + stop list */}
      {metrics ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 20, alignItems: 'start' }}>

          {/* Route map */}
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }}>Optimised Route</span>
                <span style={{ ...mono, fontSize: '0.62rem', color: 'var(--sub)', marginLeft: 10 }}>NEAREST-NEIGHBOUR TSP</span>
              </div>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 20, height: 2, background: '#29ABE2', borderRadius: 1, borderBottom: '2px dashed #29ABE2' }} />
                  <span style={{ fontSize: '0.62rem', color: 'var(--sub)', ...mono }}>Route</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1' }} />
                  <span style={{ fontSize: '0.62rem', color: 'var(--sub)', ...mono }}>Skipped</span>
                </div>
              </div>
            </div>
            <RouteMap route={metrics.route} allBins={bins} height={380} />
          </div>

          {/* Ordered stop list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {metrics.segments.map(({ bin, distFromPrev }, i) => (
              <div key={bin.id}>
                {/* Distance connector */}
                {i > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0 2px 20px', marginBottom: 2 }}>
                    <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
                    <div style={{ ...mono, fontSize: '0.62rem', color: 'var(--muted)' }}>{distFromPrev.toFixed(2)} km</div>
                  </div>
                )}
                <Link to={`/fleet/${bin.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ ...card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.18s', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(41,171,226,0.12)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}>
                    {/* Stop number */}
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: i === 0 ? 'var(--blue)' : 'var(--ink)', border: `1px solid ${i === 0 ? 'var(--blue)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ ...mono, fontSize: '0.72rem', fontWeight: 700, color: i === 0 ? '#fff' : 'var(--sub)' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div>
                          <div style={{ ...mono, fontSize: '0.63rem', color: 'var(--blue)', fontWeight: 700, marginBottom: 2 }}>{bin.id}</div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{bin.name}</div>
                        </div>
                        <StatusBadge status={bin.status} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1 }}><FillBar pct={Math.round(bin.fill)} height={5} glow /></div>
                        <span style={{ ...mono, fontSize: '0.72rem', color: fillColor(bin.fill), fontWeight: 700, minWidth: 34, textAlign: 'right' }}>{Math.round(bin.fill)}%</span>
                      </div>
                    </div>
                    <ChevronRight size={14} color="var(--muted)" style={{ flexShrink: 0 }} />
                  </div>
                </Link>
              </div>
            ))}

            {/* Route summary card */}
            <div style={{ ...card, padding: '16px 18px', marginTop: 4, background: 'linear-gradient(135deg,#ffffff 0%,#f0f9ff 100%)', borderColor: 'rgba(41,171,226,0.2)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Route Summary</div>
              {[
                ['Total distance',     `${metrics.distance.toFixed(2)} km`],
                ['Est. drive time',    formatDuration(Math.round(metrics.totalMin - metrics.stops * 10))],
                ['Stop time',         `${metrics.stops * 10} min`],
                ['Total duration',    formatDuration(metrics.totalMin)],
                ['CO₂ emitted',       `${metrics.co2kg} kg`],
                ['Fuel cost',         `€${metrics.fuelEur} (${metrics.fuelL}L)`],
                ['vs fixed schedule', `${metrics.savingsPct > 0 ? '-' : ''}${metrics.savingsPct}% distance`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--ink)', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--sub)' }}>{k}</span>
                  <span style={{ ...mono, color: 'var(--text)', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ ...card, padding: '60px 40px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--ink)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MapPin size={22} color="var(--muted)" />
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Fleet is clear</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--sub)' }}>
            No bins above the {threshold}% threshold require collection right now.
          </div>
          <div style={{ marginTop: 16, ...mono, fontSize: '0.68rem', color: 'var(--muted)' }}>
            Lower the threshold to see more bins · or wait for fill levels to rise
          </div>
        </div>
      )}
    </div>
  )
}
