import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { fillColor } from '../data/bins'
import FillBar from '../components/FillBar'
import StatusBadge from '../components/StatusBadge'
import ArcGauge from '../components/ArcGauge'

const S = {
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow)' },
  mono: { fontFamily: 'IBM Plex Mono, monospace' },
}

export default function Bins() {
  const { bins: BINS } = useApp()
  const [q, setQ]           = useState('')
  const [filter, setFilter] = useState('all')
  const [view, setView]     = useState('grid')

  const filtered = BINS.filter(b => {
    const mq = b.name.toLowerCase().includes(q.toLowerCase()) ||
               b.id.toLowerCase().includes(q.toLowerCase()) ||
               b.area.toLowerCase().includes(q.toLowerCase())
    const ms = filter === 'all' || b.status === filter
    return mq && ms
  })

  return (
    <div style={{ padding: '28px 32px', animation: 'slideUp 0.35s ease both' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.7rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 4 }}>Bin Fleet</h1>
          <div style={{ ...S.mono, fontSize: '0.7rem', color: 'var(--sub)' }}>{BINS.length} units deployed · Malta</div>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--raised)', borderRadius: 8, padding: 3, border: '1px solid var(--border)' }}>
          {['grid','list'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: '0.75rem', fontFamily: 'Figtree, sans-serif', fontWeight: 500,
              background: view === v ? 'var(--card)' : 'transparent',
              color: view === v ? 'var(--text)' : 'var(--sub)',
              transition: 'all 0.15s',
            }}>
              {v === 'grid' ? 'Grid' : 'List'}
            </button>
          ))}
        </div>
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search by ID, name or area…"
          aria-label="Search bins by ID, name or area"
          style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '9px 14px', color: 'var(--text)',
            fontSize: '0.82rem', outline: 'none', flex: '1 1 240px',
            fontFamily: 'Figtree, sans-serif',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--border2)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
        />
        <div role="group" aria-label="Filter by status" style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {['all','online','full','warning','fault','offline'].map(s => (
            <button key={s} onClick={() => setFilter(s)} aria-pressed={filter === s} style={{
              fontSize: '0.68rem', fontWeight: 600, padding: '7px 12px', borderRadius: 6,
              border: '1px solid', cursor: 'pointer',
              fontFamily: 'IBM Plex Mono, monospace', transition: 'all 0.15s',
              background: filter === s ? 'var(--blue)' : 'transparent',
              color: filter === s ? '#fff' : 'var(--sub)',
              borderColor: filter === s ? 'var(--blue)' : 'var(--border2)',
            }}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(255px,1fr))', gap: 12 }}>
          {filtered.map(b => (
            <Link key={b.id} to={`/fleet/${b.id}`} style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <div style={{ ...S.card, padding: '18px', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.transform = 'none' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right,rgba(41,171,226,0.07) 0%,transparent 70%)` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ ...S.mono, fontSize: '0.68rem', color: 'var(--blue)', fontWeight: 600, marginBottom: 3 }}>{b.id}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{b.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--sub)' }}>{b.area}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <StatusBadge status={b.status} />
                    <ArcGauge pct={b.fill} size={52} stroke={5} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  {[['BATTERY',`${b.battery}%`,b.battery<20],['CYCLES',b.cycles,false],['SIGNAL',`${b.signal}/4`,b.signal<2]].map(([l,v,warn]) => (
                    <div key={l}>
                      <div style={{ fontSize: '0.58rem', color: 'var(--muted)', ...S.mono, marginBottom: 2 }}>{l}</div>
                      <div style={{ fontSize: '0.78rem', ...S.mono, fontWeight: 500, color: warn ? 'var(--crimson)' : 'var(--sub)' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--sub)', fontSize: '0.85rem' }}>
              No bins match filters.
            </div>
          )}
        </div>
      ) : (
        /* List / table view — keyboard accessible with real Link rows */
        <div style={{ ...S.card, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }} role="table">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Unit','Name','Area','Status','Fill','Battery','Cycles',''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--muted)', fontWeight: 600, fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', ...S.mono, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--surface)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--raised)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 14px', ...S.mono, color: 'var(--blue)', fontWeight: 600, fontSize: '0.72rem' }}>{b.id}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--text)', fontWeight: 500 }}>{b.name}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--sub)', ...S.mono, fontSize: '0.72rem' }}>{b.area}</td>
                  <td style={{ padding: '10px 14px' }}><StatusBadge status={b.status} /></td>
                  <td style={{ padding: '10px 14px', minWidth: 120 }}><FillBar pct={b.fill} showLabel /></td>
                  <td style={{ padding: '10px 14px', ...S.mono, fontSize: '0.72rem', color: b.battery < 20 ? 'var(--crimson)' : 'var(--sub)' }}>{b.battery}%</td>
                  <td style={{ padding: '10px 14px', ...S.mono, fontSize: '0.72rem', color: 'var(--sub)' }}>{b.cycles}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <Link to={`/fleet/${b.id}`} aria-label={`View details for ${b.name}`}
                      style={{ color: 'var(--blue)', textDecoration: 'none', fontSize: '0.78rem', cursor: 'pointer' }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
