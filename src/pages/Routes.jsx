import { useState } from 'react'
import { BINS, fillColor } from '../data/bins'
import FillBar from '../components/FillBar'
import StatusBadge from '../components/StatusBadge'

export default function Routes() {
  const [threshold, setThreshold] = useState(80)
  const fullBins = BINS.filter(b => b.fill >= threshold && b.status !== 'offline')
  const sorted = [...fullBins].sort((a, b) => b.fill - a.fill)

  return (
    <main style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '1.9rem', color: '#fff', marginBottom: 4 }}>Collection Routes</h1>
        <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Optimised routing from live fill data</p>
      </div>

      {/* Controls */}
      <div style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, padding: '20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: '0.72rem', color: '#475569', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 8 }}>
              COLLECTION THRESHOLD: <span style={{ color: '#a3e635' }}>{threshold}%</span>
            </label>
            <input type="range" min={50} max={95} value={threshold} onChange={e => setThreshold(+e.target.value)}
              style={{ width: '100%', accentColor: '#a3e635' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '2rem', color: '#a3e635', fontWeight: 700, lineHeight: 1 }}>{sorted.length}</div>
            <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>bins require collection</div>
          </div>
          <button style={{ background: '#a3e635', color: '#0a0f1e', fontWeight: 700, fontSize: '0.82rem', padding: '10px 20px', borderRadius: 9, border: 'none', cursor: 'pointer' }}>
            Generate Route
          </button>
        </div>
      </div>

      {/* Route list */}
      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#334155', fontSize: '0.85rem' }}>
          No bins above {threshold}% fill threshold.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map((b, i) => (
            <div key={b.id} style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.2rem', fontWeight: 700, color: '#162347', minWidth: 28, textAlign: 'center' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                  <div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#a3e635', marginRight: 8 }}>{b.id}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{b.name}</span>
                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>{b.location}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <FillBar pct={b.fill} height={6} showLabel />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {sorted.length > 0 && (
        <div style={{ marginTop: 24, background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: '#475569' }}>Estimated stops: </span>
              <span style={{ color: '#a3e635', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{sorted.length}</span>
            </div>
            <div>
              <span style={{ color: '#475569' }}>Collection priority: </span>
              <span style={{ color: '#a3e635', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{sorted[0]?.name}</span>
            </div>
            <div>
              <span style={{ color: '#475569' }}>Route efficiency gain: </span>
              <span style={{ color: '#a3e635', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>~28% vs static schedule</span>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
