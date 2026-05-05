import { Link } from 'react-router-dom'
import { ArrowRight, Wifi, Sun, Zap, Shield, BarChart3, Route, Wrench, Globe, Footprints, Flame, Cigarette } from 'lucide-react'

const STATS = [
  { value: '8:1', label: 'Compression ratio' },
  { value: '960 L', label: 'Effective capacity' },
  { value: '24/7', label: 'Autonomous operation' },
  { value: '−20/+60°C', label: 'Operating range' },
]

const FEATURES = [
  { icon: Sun, title: 'Solar + Battery', desc: 'Top-mounted PV with tempered-glass armour, 2×12V 20Ah gel batteries, 400 Wh storage, low-voltage mode.' },
  { icon: Zap, title: '7 kN Compaction', desc: 'Electric linear press, up to 8:1 compression — 120 L liner equals 960 L effective capacity.' },
  { icon: Wifi, title: '4G / LTE Telemetry', desc: 'Continuous real-time upload to cloud control room via GSM IoT module.' },
  { icon: BarChart3, title: 'Live Diagnostics', desc: 'Fill %, battery voltage, temperature, signal and fault codes streamed in real time.' },
  { icon: Route, title: 'Route Optimisation', desc: 'AI-generated collection routes from live and historical fill data.' },
  { icon: Globe, title: 'Open REST API', desc: 'Authenticated REST endpoints and event webhooks — plug & play integration.' },
  { icon: Wrench, title: 'Maintenance Suite', desc: 'Digital service logs, fault tickets and spare-parts ordering per unit.' },
  { icon: Shield, title: 'Safety Interlocks', desc: 'Compactor stops on door open · jam detection · receives waste during cycle.' },
  { icon: Footprints, title: 'Touch-free Pedal', desc: 'Foot-operated aperture, fully accessible to persons with disabilities.' },
  { icon: Flame, title: 'Smoke & Fire Sensor', desc: 'Continuous environmental monitoring with instant alarm dispatch and auto-extinguisher.' },
  { icon: Shield, title: 'Anti-Vandalism', desc: '1.5 mm #304 stainless steel body, reinforced hinges, GPS anti-theft tracking.' },
  { icon: Cigarette, title: 'Cigarette Disposal', desc: 'Integrated extinguisher plate and dedicated ash receptacle.' },
]

const CERTS = ['CE Marked', 'ISO Certified', 'RoHS Compliant', 'PWD Accessible', 'Coastal Grade #304 SS', 'Open REST API']

const STEPS = [
  { n: '01', title: 'Smart bins deployed', desc: 'Solar-powered compactor bins installed across the city, each with a 4G telemetry unit.' },
  { n: '02', title: 'Data streams to the cloud', desc: 'Real-time fill level, battery, temperature and fault events transmitted continuously.' },
  { n: '03', title: 'Operations optimised', desc: 'Routes auto-generated, alerts dispatched and analytics ready for your team.' },
]

export default function Home() {
  return (
    <main style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Hero */}
      <section style={{ padding: '100px 24px 80px', maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 64, alignItems: 'center' }}>
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.3)', borderRadius: 9999, padding: '4px 14px', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a3e635', boxShadow: '0 0 8px #a3e635' }} />
            <span style={{ fontSize: '0.75rem', color: '#a3e635', fontWeight: 600, letterSpacing: '0.05em' }}>POWERED BY HANDSON SYSTEMS</span>
          </div>

          <h1 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 'clamp(2.4rem,5vw,3.8rem)', lineHeight: 1.1, color: '#fff', marginBottom: 20, letterSpacing: '-0.02em' }}>
            Smarter bins.<br />
            <span style={{ background: 'linear-gradient(135deg,#fff,#a3e635)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Cleaner cities.
            </span>
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
            Solar-powered smart compactor bins with real-time IoT telemetry, automated collection routing and a powerful web management console — all in one platform.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/dashboard" style={{ background: '#a3e635', color: '#0a0f1e', fontWeight: 700, fontSize: '0.875rem', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Open live dashboard <ArrowRight size={16} />
            </Link>
            <Link to="/bins" style={{ border: '1px solid #162347', color: '#cbd5e1', fontWeight: 500, fontSize: '0.875rem', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', transition: 'border-color 0.2s' }}>
              Browse fleet
            </Link>
          </div>

          {/* stat row */}
          <div style={{ display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.value}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 600, color: '#a3e635', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bin illustration card */}
        <div style={{ flex: '0 0 280px', position: 'relative' }}>
          <div style={{ background: 'linear-gradient(160deg,#111d38,#0d1528)', border: '1px solid #162347', borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden' }}>
            {/* glow */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(163,230,53,0.08)', borderRadius: '50%', filter: 'blur(40px)' }} />

            {/* Bin SVG illustration */}
            <svg viewBox="0 0 160 260" style={{ width: '100%', maxWidth: 160, margin: '0 auto', display: 'block' }}>
              {/* solar panel */}
              <rect x="20" y="8" width="120" height="20" rx="4" fill="#162347" stroke="#1e3163" strokeWidth="1"/>
              <rect x="24" y="10" width="30" height="16" rx="2" fill="#1e3163"/>
              <rect x="58" y="10" width="30" height="16" rx="2" fill="#1e3163"/>
              <rect x="92" y="10" width="30" height="16" rx="2" fill="#1e3163"/>
              {/* body */}
              <rect x="15" y="30" width="130" height="220" rx="8" fill="#0d1528" stroke="#162347" strokeWidth="1.5"/>
              {/* aperture */}
              <rect x="25" y="45" width="110" height="55" rx="6" fill="#111d38" stroke="#1e3163" strokeWidth="1"/>
              <rect x="35" y="55" width="90" height="35" rx="4" fill="#0a0f1e"/>
              {/* HandsOn logo text */}
              <text x="80" y="125" textAnchor="middle" fill="#a3e635" fontSize="9" fontFamily="DM Sans, sans-serif" fontWeight="700">handson</text>
              {/* wifi icon */}
              <text x="80" y="148" textAnchor="middle" fill="#a3e635" fontSize="8" fontFamily="DM Sans, sans-serif">SMART BIN ◈</text>
              {/* lower access door */}
              <rect x="25" y="165" width="110" height="70" rx="5" fill="#111d38" stroke="#1e3163" strokeWidth="1"/>
              {/* lock */}
              <rect x="70" y="192" width="20" height="16" rx="3" fill="#162347" stroke="#1e3163" strokeWidth="1"/>
              <circle cx="80" cy="191" r="5" fill="none" stroke="#1e3163" strokeWidth="1.5"/>
            </svg>

            {/* status chip */}
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>BATTERY</div>
                <div style={{ fontSize: '0.9rem', color: '#a3e635', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>92%</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(163,230,53,0.1)', border: '1px solid rgba(163,230,53,0.3)', borderRadius: 9999, padding: '3px 10px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a3e635', boxShadow: '0 0 6px #a3e635' }} />
                <span style={{ fontSize: '0.7rem', color: '#a3e635', fontFamily: 'JetBrains Mono, monospace' }}>Online · 78% full</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section style={{ background: 'rgba(13,21,40,0.5)', borderTop: '1px solid #111d38', borderBottom: '1px solid #111d38', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: '#fff', marginBottom: 12 }}>
              Everything you need to manage a smart fleet
            </h2>
            <p style={{ color: '#64748b', maxWidth: 500, margin: '0 auto' }}>
              From the bin in the street to the data on your screen — one connected system.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: '#0d1528', border: '1px solid #111d38', borderRadius: 12, padding: '20px 20px', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#162347'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#111d38'}>
                <f.icon size={18} style={{ color: '#a3e635', marginBottom: 10 }} />
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {CERTS.map(c => (
            <span key={c} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', background: '#0d1528', border: '1px solid #162347', borderRadius: 9999, padding: '6px 16px' }}>
              ✓ {c}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 24px', background: 'rgba(13,21,40,0.4)', borderTop: '1px solid #111d38' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 'clamp(1.6rem,3vw,2.4rem)', color: '#fff' }}>
            How it works
          </h2>
        </div>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ flex: '1 1 220px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '2.5rem', fontWeight: 700, color: '#162347', lineHeight: 1, marginBottom: 12 }}>{s.n}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6 }}>{s.desc}</div>
              {i < STEPS.length - 1 && (
                <div style={{ display: 'none' }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'DM Serif Display, Georgia, serif', fontSize: 'clamp(1.6rem,3vw,2.4rem)', color: '#fff', marginBottom: 16 }}>
            Ready to upgrade your waste operations?
          </h2>
          <p style={{ color: '#64748b', marginBottom: 32 }}>
            Open the management console to see live bin status, alerts and analytics.
          </p>
          <Link to="/dashboard" style={{ background: '#a3e635', color: '#0a0f1e', fontWeight: 700, fontSize: '0.9rem', padding: '14px 32px', borderRadius: 10, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Launch console <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #0d1528', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', color: '#334155' }}>
          HandsOn SmartBin · Powered by HandsOn Systems · CT2386-2025 · Malta
        </div>
      </footer>
    </main>
  )
}
