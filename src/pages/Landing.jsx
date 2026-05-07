import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, DEMO_CREDS } from '../context/AuthContext'
import { HandsOnBadge } from '../components/HandsOnLogo'
import {
  Eye, EyeOff, Wifi, BarChart2, ShieldCheck, Zap,
  ArrowRight, Copy, Check, ChevronDown, AlertTriangle, TrendingUp, Radio,
} from 'lucide-react'

/* ── Design tokens (landing-specific — standalone page) ── */
const C = {
  blue:    '#29ABE2',
  blueDim: 'rgba(41,171,226,0.12)',
  blueBdr: 'rgba(41,171,226,0.3)',
  green:   '#10b981',
  amber:   '#f59e0b',
  red:     '#ef4444',
  bg:      '#0f172a',
  surface: '#1e293b',
  border:  '#334155',
  text:    '#f8fafc',
  sub:     '#94a3b8',
  muted:   '#64748b',
}
const display = { fontFamily: "'Syne', sans-serif" }
const mono    = { fontFamily: "'IBM Plex Mono', monospace" }
const ui      = { fontFamily: "'Plus Jakarta Sans', sans-serif" }

/* ── useInView hook for scroll animations ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function FadeIn({ children, delay = 0, direction = 'up' }) {
  const [ref, visible] = useInView()
  const transforms = { up: 'translateY(24px)', down: 'translateY(-24px)', left: 'translateX(-24px)', right: 'translateX(24px)' }
  return (
    <div ref={ref} style={{
      opacity:    visible ? 1 : 0,
      transform:  visible ? 'none' : transforms[direction],
      transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
    }}>
      {children}
    </div>
  )
}

/* ── Login form (admin) ── */
function LoginForm() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    if (login(email, password)) navigate('/dashboard')
    else { setError('Invalid email or password'); setLoading(false) }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: '1px solid #334155', background: '#1e293b',
    color: C.text, fontSize: '0.88rem', ...ui, outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s ease-out',
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={{ fontSize: '0.75rem', color: C.sub, display: 'block', marginBottom: 6, ...ui }}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          placeholder="admin@handson.io" style={inputStyle}
          onFocus={e => e.target.style.borderColor = C.blue}
          onBlur={e => e.target.style.borderColor = '#334155'} />
      </div>
      <div>
        <label style={{ fontSize: '0.75rem', color: C.sub, display: 'block', marginBottom: 6, ...ui }}>Password</label>
        <div style={{ position: 'relative' }}>
          <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
            placeholder="••••••••" style={{ ...inputStyle, paddingRight: 42 }}
            onFocus={e => e.target.style.borderColor = C.blue}
            onBlur={e => e.target.style.borderColor = '#334155'} />
          <button type="button" onClick={() => setShowPw(p => !p)} aria-label={showPw ? 'Hide password' : 'Show password'}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: C.muted, display: 'flex', alignItems: 'center' }}>
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      {error && (
        <div style={{ fontSize: '0.78rem', color: C.red, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 7, padding: '9px 13px', ...ui }}>
          {error}
        </div>
      )}
      <button type="submit" disabled={loading} style={{
        background: C.blue, color: '#fff', border: 'none', borderRadius: 9,
        padding: '12px 0', fontSize: '0.9rem', fontWeight: 700, ...ui,
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
        boxShadow: '0 4px 16px rgba(41,171,226,0.35)', marginTop: 2,
      }}>
        {loading ? 'Signing in…' : 'Sign In →'}
      </button>
    </form>
  )
}

/* ── Demo card ── */
function DemoCard() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [copied,   setCopied]  = useState(null)
  const [loading,  setLoading] = useState(false)

  const copy = async (text, field) => {
    await navigator.clipboard.writeText(text).catch(() => {})
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const loginDemo = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    login(DEMO_CREDS.email, DEMO_CREDS.password)
    navigate('/dashboard')
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(41,171,226,0.08) 0%, rgba(41,171,226,0.04) 100%)',
      border: `1.5px solid ${C.blueBdr}`, borderRadius: 16,
      padding: '28px', display: 'flex', flexDirection: 'column', gap: 20,
    }}>
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.blueDim, border: `1px solid ${C.blueBdr}`, borderRadius: 20, padding: '4px 12px', marginBottom: 12 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.blue, display: 'inline-block', animation: 'breathe 1.5s ease-in-out infinite' }} />
          <span style={{ ...mono, fontSize: '0.65rem', color: C.blue, fontWeight: 700 }}>DEMO ACCOUNT</span>
        </div>
        <h3 style={{ ...display, fontSize: '1.2rem', fontWeight: 700, color: C.text, margin: '0 0 8px' }}>Try it instantly</h3>
        <p style={{ fontSize: '0.83rem', color: C.sub, margin: 0, lineHeight: 1.65, ...ui }}>
          Full dashboard with 8 simulated bins across Malta — no setup required.
        </p>
      </div>

      <div style={{ background: 'rgba(15,23,42,0.6)', borderRadius: 10, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        {[['Email', DEMO_CREDS.email, 'email'], ['Password', DEMO_CREDS.password, 'pw']].map(([label, val, field], i) => (
          <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderBottom: i === 0 ? `1px solid ${C.border}` : 'none' }}>
            <div>
              <div style={{ fontSize: '0.62rem', color: C.muted, marginBottom: 3, ...mono }}>{label}</div>
              <div style={{ ...mono, fontSize: '0.82rem', color: C.text, fontWeight: 600 }}>{val}</div>
            </div>
            <button onClick={() => copy(val, field)} aria-label={`Copy ${label}`}
              style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 9px', cursor: 'pointer', color: copied === field ? C.green : C.muted, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', ...ui, transition: 'color 0.2s ease-out, border-color 0.2s ease-out' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = copied === field ? C.green : C.muted }}>
              {copied === field ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
            </button>
          </div>
        ))}
      </div>

      <button onClick={loginDemo} disabled={loading} style={{
        background: C.blue, color: '#fff', border: 'none', borderRadius: 10,
        padding: '14px 0', fontSize: '0.92rem', fontWeight: 700, ...ui, cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.8 : 1, boxShadow: '0 4px 20px rgba(41,171,226,0.4)',
        letterSpacing: '-0.01em',
      }}
        onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 6px 28px rgba(41,171,226,0.55)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(41,171,226,0.4)'; e.currentTarget.style.transform = 'none' }}>
        {loading ? 'Loading demo…' : 'Launch Demo →'}
      </button>
    </div>
  )
}

/* ── Stats bar ── */
const STATS = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<60s',  label: 'Alert response' },
  { value: '40%',   label: 'CO₂ reduction' },
  { value: '24/7',  label: 'Live monitoring' },
]

/* ── Features ── */
const FEATURES = [
  { icon: Wifi,         title: 'Real-Time Telemetry',      desc: 'Live UART/TCP frame stream from every unit. Fill, battery, temperature, door state — every heartbeat.' },
  { icon: Zap,          title: 'Solar-Powered Compaction',  desc: 'Self-sustaining units with automatic compaction cycles, overflow detection, and jam recovery.' },
  { icon: BarChart2,    title: 'Fleet Analytics',           desc: 'Route optimisation, collection queue prioritisation, uptime tracking, and CO₂ savings reporting.' },
  { icon: ShieldCheck,  title: 'Instant Alerts',            desc: 'Smoke detection, jams, battery warnings, and connection loss — surfaced in under 60 seconds.' },
]

/* ── Protocol log strip ── */
const LOG_ROWS = [
  { dir: 'UART→TCP', hex: 'E9 00 0F 38 36 37 31 30 35 30 37…', decoded: 'Handshake · IMEI identified', color: C.blue },
  { dir: 'TCP→UART', hex: 'E9 AB 00 0D 0A',                    decoded: 'ACK · server confirmed',     color: '#a78bfa' },
  { dir: 'UART→TCP', hex: 'E9 09 06 01 3E 58 1C 00 00 0D 0A', decoded: 'Counts / heartbeat',          color: C.blue },
  { dir: 'TCP→UART', hex: 'E9 AB 00 0D 0A',                    decoded: 'ACK · server confirmed',     color: '#a78bfa' },
  { dir: 'UART→TCP', hex: 'E9 11 02 00 01 0D 0A',             decoded: 'Alert · smoke detected',     color: C.red },
  { dir: 'TCP→UART', hex: 'E9 11 00 0D 0A',                   decoded: 'ACK · alert received',        color: '#a78bfa' },
]

export default function Landing() {
  const loginRef = useRef(null)
  const scrollToLogin = () => loginRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, ...ui, overflowX: 'hidden' }}>

      {/* ── Sticky header ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 'var(--z-top)', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${C.border}`, padding: '0 40px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          <HandsOnBadge iconSize={28} color={C.blue} subColor={C.muted} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={scrollToLogin}
              style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 8, padding: '8px 18px', fontSize: '0.82rem', fontWeight: 500, ...ui, cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sub }}>
              Sign In
            </button>
            <button onClick={scrollToLogin}
              style={{ background: C.blue, border: 'none', color: '#fff', borderRadius: 8, padding: '8px 20px', fontSize: '0.82rem', fontWeight: 700, ...ui, cursor: 'pointer', boxShadow: '0 2px 10px rgba(41,171,226,0.35)' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 18px rgba(41,171,226,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(41,171,226,0.35)'; e.currentTarget.style.transform = 'none' }}>
              Try Demo
            </button>
          </div>
        </div>
      </header>

      {/* ── CHAPTER 1: Hero — the hook ── */}
      <section style={{ padding: 'clamp(80px, 12vw, 140px) 40px clamp(60px, 8vw, 100px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(41,171,226,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.blueDim, border: `1px solid ${C.blueBdr}`, borderRadius: 20, padding: '6px 16px', marginBottom: 32 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.blue, display: 'inline-block', animation: 'breathe 1.5s ease-in-out infinite' }} />
            <span style={{ ...mono, fontSize: '0.68rem', color: C.blue, fontWeight: 700 }}>LIVE FLEET MONITORING</span>
          </div>
          <h1 style={{ ...display, fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 24px' }}>
            Smart Waste Management,<br />
            <span style={{ color: C.blue }}>Reinvented.</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: C.sub, lineHeight: 1.75, margin: '0 auto 44px', maxWidth: 580 }}>
            Real-time telemetry, solar-powered compaction, and predictive fleet analytics — all from one dashboard.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={scrollToLogin}
              style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 12, padding: '15px 36px', fontSize: '1rem', fontWeight: 700, ...ui, cursor: 'pointer', boxShadow: '0 4px 24px rgba(41,171,226,0.45)', display: 'flex', alignItems: 'center', gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 32px rgba(41,171,226,0.6)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(41,171,226,0.45)'; e.currentTarget.style.transform = 'none' }}>
              Launch Demo <ArrowRight size={16} />
            </button>
            <button onClick={() => document.getElementById('chapter2')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: 'rgba(255,255,255,0.05)', color: C.sub, border: `1px solid ${C.border}`, borderRadius: 12, padding: '15px 36px', fontSize: '1rem', fontWeight: 500, ...ui, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sub }}>
              Learn more <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div style={{ background: C.blue, padding: '22px 40px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ ...display, fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.78)', marginTop: 4, ...ui }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHAPTER 2: Problem ── */}
      <section id="chapter2" style={{ padding: 'clamp(70px,10vw,120px) 40px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 20, padding: '5px 14px', marginBottom: 20 }}>
                <AlertTriangle size={12} color={C.red} />
                <span style={{ ...mono, fontSize: '0.65rem', color: C.red, fontWeight: 700 }}>THE PROBLEM</span>
              </div>
              <h2 style={{ ...display, fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
                Traditional waste management<br />is flying blind
              </h2>
              <p style={{ fontSize: '1rem', color: C.sub, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
                Fixed collection schedules waste fuel, overflow bins damage reputation, and there's no visibility into what's happening in the field.
              </p>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            {[
              { icon: TrendingUp, title: 'Wasted collections', desc: '40% of trucks arrive at bins that are less than 50% full — pure fuel cost with no return.', color: C.red },
              { icon: AlertTriangle, title: 'Overflow incidents', desc: 'No real-time fill data means bins overflow before anyone knows — public health risk.', color: C.amber },
              { icon: Radio, title: 'Zero visibility', desc: "Paper logs and manual checks can't tell you battery level, door state, or jam status.", color: C.muted },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 100} direction="up">
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 22px', height: '100%' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${item.color}15`, border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <item.icon size={18} color={item.color} />
                  </div>
                  <h3 style={{ ...display, fontSize: '1rem', fontWeight: 700, color: C.text, margin: '0 0 8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.83rem', color: C.sub, margin: 0, lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHAPTER 3: Solution — features ── */}
      <section style={{ padding: 'clamp(70px,10vw,120px) 40px', background: C.surface }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.blueDim, border: `1px solid ${C.blueBdr}`, borderRadius: 20, padding: '5px 14px', marginBottom: 20 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.blue, display: 'inline-block' }} />
                <span style={{ ...mono, fontSize: '0.65rem', color: C.blue, fontWeight: 700 }}>THE SOLUTION</span>
              </div>
              <h2 style={{ ...display, fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.03em', margin: '0 0 16px' }}>
                Everything you need<br />to manage a smart fleet
              </h2>
              <p style={{ fontSize: '1rem', color: C.sub, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
                From a single unit to hundreds — one platform, one dashboard.
              </p>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 80} direction="up">
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px 24px', height: '100%', transition: 'border-color 0.2s ease-out, box-shadow 0.2s ease-out, transform 0.2s ease-out', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.boxShadow = '0 4px 24px rgba(41,171,226,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: C.blueDim, border: `1px solid ${C.blueBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <f.icon size={20} color={C.blue} />
                  </div>
                  <h3 style={{ ...display, fontSize: '1.05rem', fontWeight: 700, color: C.text, margin: '0 0 10px' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.83rem', color: C.sub, margin: 0, lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHAPTER 4: How it works — protocol strip ── */}
      <section style={{ padding: 'clamp(70px,10vw,120px) 40px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <FadeIn direction="left">
            <div style={{ ...mono, fontSize: '0.68rem', color: C.blue, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16 }}>HARDWARE INTEGRATION</div>
            <h2 style={{ ...display, fontSize: 'clamp(1.6rem,3.5vw,2.2rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.03em', margin: '0 0 18px', lineHeight: 1.25 }}>
              Direct connection to the HY-CKX1 compressor unit
            </h2>
            <p style={{ fontSize: '0.9rem', color: C.sub, lineHeight: 1.75, margin: '0 0 28px' }}>
              The platform speaks the native E9xx UART protocol. Raw telemetry frames are parsed and displayed the moment they arrive — no middleware, no polling delay.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['IMEI handshake','Heartbeat ACK','Smoke alert','GPS location','Battery state'].map(tag => (
                <span key={tag} style={{ ...mono, fontSize: '0.65rem', color: C.blue, background: C.blueDim, border: `1px solid ${C.blueBdr}`, borderRadius: 6, padding: '4px 10px' }}>{tag}</span>
              ))}
            </div>
          </FadeIn>
          <FadeIn direction="right" delay={100}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
                <span style={{ ...mono, fontSize: '0.65rem', color: C.sub }}>LIVE PROTOCOL STREAM</span>
              </div>
              {LOG_ROWS.map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '5px 0', borderBottom: i < LOG_ROWS.length - 1 ? `1px solid rgba(51,65,85,0.5)` : 'none' }}>
                  <span style={{ ...mono, fontSize: '0.6rem', color: C.muted, minWidth: 60 }}>16:10:{String(13 + i).padStart(2,'0')}</span>
                  <span style={{ ...mono, fontSize: '0.6rem', color: row.color, minWidth: 70, fontWeight: 700 }}>{row.dir}</span>
                  <span style={{ ...mono, fontSize: '0.6rem', color: C.sub, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.hex}</span>
                  <span style={{ ...mono, fontSize: '0.58rem', color: C.muted, minWidth: 140, textAlign: 'right', flexShrink: 0 }}>{row.decoded}</span>
                </div>
              ))}
              <div style={{ paddingTop: 8 }}>
                <span style={{ ...mono, fontSize: '0.62rem', color: C.blue, animation: 'breathe 1s ease-in-out infinite' }}>█</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CHAPTER 5: Climax CTA — get access ── */}
      <section ref={loginRef} style={{ padding: 'clamp(70px,10vw,120px) 40px', background: C.surface }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <h2 style={{ ...display, fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
                Get started now
              </h2>
              <p style={{ fontSize: '0.95rem', color: C.sub, margin: 0 }}>
                Launch the demo in 5 seconds, or sign in with your admin account.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <DemoCard />

              {/* Admin login */}
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(100,116,139,0.1)', border: `1px solid ${C.border}`, borderRadius: 20, padding: '4px 12px', marginBottom: 12 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.muted, display: 'inline-block' }} />
                    <span style={{ ...mono, fontSize: '0.65rem', color: C.muted, fontWeight: 700 }}>REAL ACCOUNT</span>
                  </div>
                  <h3 style={{ ...display, fontSize: '1.2rem', fontWeight: 700, color: C.text, margin: '0 0 8px' }}>Administrator login</h3>
                  <p style={{ fontSize: '0.83rem', color: C.sub, margin: 0, lineHeight: 1.65, ...ui }}>
                    Connects live to your physical device over TCP. Real sensor data from the field.
                  </p>
                </div>
                <LoginForm />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '28px 40px', borderTop: `1px solid ${C.border}`, background: C.bg }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <HandsOnBadge iconSize={22} color={C.blue} subColor={C.muted} />
          <p style={{ fontSize: '0.73rem', color: C.muted, margin: 0, ...ui }}>
            © {new Date().getFullYear()} HandsOn SmartBin · Solar-powered waste management platform
          </p>
        </div>
      </footer>
    </div>
  )
}
