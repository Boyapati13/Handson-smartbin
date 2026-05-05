import { SPECS } from '../data/bins'

export default function Specifications() {
  return (
    <main style={{ padding: '32px 24px', maxWidth: 1000, margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(163,230,53,0.08)', border: '1px solid rgba(163,230,53,0.2)', borderRadius: 9999, padding: '3px 12px', marginBottom: 14 }}>
          <span style={{ fontSize: '0.7rem', color: '#a3e635', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>MODEL: HY-CKX1</span>
        </div>
        <h1 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: '1.9rem', color: '#fff', marginBottom: 4 }}>Technical Specifications</h1>
        <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Ecodisposer Solar-Powered Smart Waste Compactor Bin · CT2386-2025</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(440px,1fr))', gap: 20 }}>
        {SPECS.map(group => (
          <div key={group.group} style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #111d38', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 3, height: 14, background: '#a3e635', borderRadius: 9999, display: 'inline-block' }} />
              <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#a3e635', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>{group.group.toUpperCase()}</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {group.items.map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 20px', borderBottom: '1px solid #080d1a', gap: 16 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#111d38'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', flexShrink: 0, maxWidth: '45%' }}>{item.label}</span>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.5 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Compliance banner */}
      <div style={{ marginTop: 24, background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#a3e635', marginBottom: 8, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>COMPLIANCE & STANDARDS</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['CE Marked', 'Certificate of Conformity per unit', 'ISO Certified', 'RoHS Compliant', 'EN 840 (wheelie bin liner)', 'Universal accessibility design'].map(c => (
            <span key={c} style={{ fontSize: '0.74rem', color: '#94a3b8', background: '#111d38', border: '1px solid #162347', borderRadius: 9999, padding: '4px 12px' }}>✓ {c}</span>
          ))}
        </div>
      </div>

      {/* Dimensional drawing block */}
      <div style={{ marginTop: 20, background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#a3e635', marginBottom: 20, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>DIMENSIONAL OVERVIEW</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[['Width','650 mm'],['Depth','700 mm'],['Height','1400 mm'],['Weight','≈ 80 kg']].map(([dim,val]) => (
            <div key={dim} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.8rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 4 }}>{dim}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, fontSize: '0.72rem', color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>
          Waste aperture: 400 × 300 mm · Body: 1.5 mm #304 SS · Aperture: 2.0 mm #304 SS
        </div>
      </div>
    </main>
  )
}
