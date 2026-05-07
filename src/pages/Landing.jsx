import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, DEMO_CREDS } from '../context/AuthContext'
import { HandsOnBadge } from '../components/HandsOnLogo'
import {
  Eye, EyeOff, Wifi, BarChart2, ShieldCheck, Zap,
  ArrowRight, Copy, Check, ChevronDown, AlertTriangle, TrendingUp, Radio,
} from 'lucide-react'

/* ── Design tokens — HandsOn Systems brand palette (light/white B2B) ── */
const C = {
  blue:    '#29ABE2',                    // HandsOn brand blue
  blueDk:  '#1a8bbf',                    // darker blue for hover
  blueDim: 'rgba(41,171,226,0.08)',
  blueBdr: 'rgba(41,171,226,0.22)',
  green:   '#10b981',
  amber:   '#f59e0b',
  red:     '#ef4444',
  bg:      '#ffffff',                    // white (matches handsonsystems.com)
  surface: '#f8fafc',                    // very light gray sections
  surface2:'#f1f5f9',                    // slightly deeper for alternating sections
  border:  '#e2e8f0',                    // light border
  text:    '#0f172a',                    // dark navy text
  sub:     '#475569',                    // medium gray
  muted:   '#94a3b8',                    // muted gray
  dark:    '#0f172a',                    // dark sections (hero, footer)
  darkSurf:'#1e293b',
  darkBdr: '#334155',
  darkSub: '#94a3b8',
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

      {/* ── Sticky header — white like handsonsystems.com ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 'var(--z-top)', background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0', padding: '0 40px', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          <HandsOnBadge iconSize={28} color={C.blue} subColor={C.sub} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={scrollToLogin}
              style={{ background: 'transparent', border: '1px solid #e2e8f0', color: C.sub, borderRadius: 8, padding: '8px 18px', fontSize: '0.82rem', fontWeight: 500, ...ui, cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = C.sub }}>
              Sign In
            </button>
            <button onClick={scrollToLogin}
              style={{ background: C.blue, border: 'none', color: '#fff', borderRadius: 8, padding: '8px 20px', fontSize: '0.82rem', fontWeight: 700, ...ui, cursor: 'pointer', boxShadow: '0 2px 10px rgba(41,171,226,0.35)' }}
              onMouseEnter={e => { e.currentTarget.style.background = C.blueDk; e.currentTarget.style.boxShadow = '0 4px 18px rgba(41,171,226,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = C.blue; e.currentTarget.style.boxShadow = '0 2px 10px rgba(41,171,226,0.35)'; e.currentTarget.style.transform = 'none' }}>
              Try Demo
            </button>
          </div>
        </div>
      </header>

      {/* ── CHAPTER 1: Hero — full-bleed image with dark overlay ── */}
      <section style={{ position: 'relative', overflow: 'hidden', textAlign: 'center', minHeight: 620, display: 'flex', alignItems: 'center' }}>
        {/* Background city image */}
        <img
          src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1920&q=80"
          alt=""
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(10,20,44,0.88) 0%, rgba(15,30,60,0.82) 50%, rgba(10,20,44,0.9) 100%)' }} />
        {/* Blue accent glow */}
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(41,171,226,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative', padding: 'clamp(80px,12vw,140px) 40px clamp(60px,8vw,100px)', width: '100%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(41,171,226,0.15)', border: '1px solid rgba(41,171,226,0.4)', borderRadius: 20, padding: '6px 16px', marginBottom: 32 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.blue, display: 'inline-block', animation: 'breathe 1.5s ease-in-out infinite' }} />
            <span style={{ ...mono, fontSize: '0.68rem', color: C.blue, fontWeight: 700 }}>LIVE FLEET MONITORING</span>
          </div>
          <h1 style={{ ...display, fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 24px' }}>
            Smart Waste Management,<br />
            <span style={{ color: C.blue }}>Reinvented.</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'rgba(255,255,255,0.78)', lineHeight: 1.75, margin: '0 auto 44px', maxWidth: 580 }}>
            Real-time telemetry, solar-powered compaction, and predictive fleet analytics — all from one dashboard.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={scrollToLogin}
              style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 12, padding: '15px 36px', fontSize: '1rem', fontWeight: 700, ...ui, cursor: 'pointer', boxShadow: '0 4px 24px rgba(41,171,226,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = C.blueDk; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = C.blue; e.currentTarget.style.transform = 'none' }}>
              Launch Demo <ArrowRight size={16} />
            </button>
            <button onClick={() => document.getElementById('chapter2')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, padding: '15px 36px', fontSize: '1rem', fontWeight: 500, ...ui, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(8px)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}>
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

      {/* ── CHAPTER 4: How it works — protocol stream ── */}
      <section style={{ padding: 'clamp(70px,10vw,120px) 40px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <FadeIn direction="left">
            <div style={{ ...mono, fontSize: '0.68rem', color: C.blue, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16 }}>HARDWARE INTEGRATION</div>
            <h2 style={{ ...display, fontSize: 'clamp(1.6rem,3.5vw,2.2rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.03em', margin: '0 0 18px', lineHeight: 1.25 }}>
              Native protocol. Zero latency. Live from the field.
            </h2>
            <p style={{ fontSize: '0.9rem', color: C.sub, lineHeight: 1.75, margin: '0 0 32px' }}>
              The platform speaks the device's native E9xx UART protocol directly. Telemetry frames are parsed and surfaced in real time — no polling, no middleware, no delay.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { dot: C.green,  label: 'Sub-second delivery',  desc: "Every heartbeat ACK'd within 1 frame cycle" },
                { dot: C.blue,   label: 'Full frame parsing',    desc: 'Fill, battery, door state, GPS, smoke alerts' },
                { dot: '#a78bfa', label: 'Bidirectional control', desc: 'Send commands — open door, read capacity, set overflow distance' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: item.dot, boxShadow: `0 0 8px ${item.dot}`, flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: C.text, marginBottom: 2, ...ui }}>{item.label}</div>
                    <div style={{ fontSize: '0.78rem', color: C.muted, ...ui }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={100}>
            {/* Glassmorphism terminal card */}
            <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(41,171,226,0.2)', boxShadow: '0 0 0 1px rgba(41,171,226,0.05), 0 24px 64px rgba(0,0,0,0.5)', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)' }}>
              {/* Window chrome */}
              <div style={{ background: 'rgba(30,41,59,0.9)', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(51,65,85,0.6)' }}>
                <div style={{ display: 'flex', gap: 7 }}>
                  {['#ef4444','#f59e0b','#10b981'].map(col => (
                    <div key={col} style={{ width: 11, height: 11, borderRadius: '50%', background: col, opacity: 0.85 }} />
                  ))}
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, boxShadow: '0 0 8px #10b981', animation: 'breathe 1.5s ease-in-out infinite' }} />
                  <span style={{ ...mono, fontSize: '0.63rem', color: '#94a3b8', letterSpacing: '0.06em' }}>LIVE PROTOCOL STREAM · HY-CKX1</span>
                </div>
                <div style={{ ...mono, fontSize: '0.58rem', color: C.muted }}>TCP:8078</div>
              </div>

              {/* Log rows */}
              <div style={{ padding: '14px 0' }}>
                {LOG_ROWS.map((row, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 18px', borderBottom: i < LOG_ROWS.length - 1 ? '1px solid rgba(30,41,59,0.7)' : 'none', transition: 'background 0.15s', background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(41,171,226,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span style={{ ...mono, fontSize: '0.6rem', color: '#475569', minWidth: 58, flexShrink: 0 }}>16:10:{String(13 + i).padStart(2,'0')}</span>
                    <span style={{ ...mono, fontSize: '0.6rem', color: row.color, minWidth: 72, fontWeight: 700, flexShrink: 0, textShadow: `0 0 8px ${row.color}60` }}>{row.dir}</span>
                    <span style={{ ...mono, fontSize: '0.6rem', color: '#64748b', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.hex}</span>
                    <span style={{ ...mono, fontSize: '0.58rem', color: '#94a3b8', minWidth: 148, textAlign: 'right', flexShrink: 0 }}>{row.decoded}</span>
                  </div>
                ))}
                <div style={{ padding: '8px 18px' }}>
                  <span style={{ ...mono, fontSize: '0.65rem', color: C.blue, animation: 'breathe 1s ease-in-out infinite' }}>█</span>
                </div>
              </div>

              {/* Status bar */}
              <div style={{ background: 'rgba(41,171,226,0.06)', borderTop: '1px solid rgba(41,171,226,0.15)', padding: '8px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[['UART→TCP','4'],['TCP→UART','2'],['Alerts','1']].map(([k,v]) => (
                    <div key={k} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      <span style={{ ...mono, fontSize: '0.55rem', color: C.muted }}>{k}</span>
                      <span style={{ ...mono, fontSize: '0.62rem', color: C.blue, fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <span style={{ ...mono, fontSize: '0.55rem', color: C.muted }}>E9xx · ACK OK</span>
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

      {/* ── Trusted by ── */}
      <section style={{ padding: '36px 40px', background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ ...mono, fontSize: '0.62rem', color: C.muted, letterSpacing: '0.12em', marginBottom: 24 }}>TRUSTED BY LEADING ORGANISATIONS</div>
          <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center', opacity: 0.55 }}>
            {['Bolt', 'G4S', 'Lufthansa', 'TNT', 'Malta Public Transport', 'City Sightseeing Malta'].map(c => (
              <span key={c} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: C.text, whiteSpace: 'nowrap' }}>{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── About HandsOn Systems ── */}
      <section style={{ padding: 'clamp(70px,10vw,110px) 40px', background: C.bg }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', marginBottom: 72 }}>
              <div>
                <div style={{ ...mono, fontSize: '0.65rem', color: C.blue, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16 }}>ABOUT HANDSON SYSTEMS</div>
                <h2 style={{ ...display, fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.03em', margin: '0 0 18px', lineHeight: 1.2 }}>
                  Connected Solutions for<br /><span style={{ color: C.blue }}>Tomorrow's World, Today</span>
                </h2>
                <p style={{ fontSize: '0.92rem', color: C.sub, lineHeight: 1.8, margin: '0 0 24px', ...ui }}>
                  HandsOn Systems Ltd. is a Malta-based technology firm composed of skilled innovators focused on researching and developing advanced technological solutions — from GPS fleet management and IoT platforms to smart waste monitoring and usage-based insurance.
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['GPS Tracking', 'Fleet Management', 'IoT Solutions', 'RFID Tracking', 'Smart Energy', 'Workforce Mgmt'].map(tag => (
                    <span key={tag} style={{ ...mono, fontSize: '0.62rem', color: C.blue, background: C.blueDim, border: `1px solid ${C.blueBdr}`, borderRadius: 6, padding: '4px 10px' }}>{tag}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { value: '24/7',  label: 'Support & monitoring' },
                  { value: '99.9%', label: 'Platform uptime SLA' },
                  { value: '6+',    label: 'Enterprise clients' },
                  { value: 'Malta', label: 'HQ — Mosta Techno Park' },
                ].map(s => (
                  <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '22px 20px', textAlign: 'center' }}>
                    <div style={{ ...display, fontSize: '1.9rem', fontWeight: 800, color: C.blue, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '0.72rem', color: C.muted, marginTop: 6, ...ui }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Services grid */}
          <FadeIn delay={100}>
            <div style={{ ...mono, fontSize: '0.65rem', color: C.blue, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 24, textAlign: 'center' }}>OUR SOLUTIONS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
              {[
                { title: 'Fleet Management',    desc: 'Vehicle location, speed, fuel, temperature and route optimisation in real time.' },
                { title: 'IoT Platform',         desc: 'Parking sensors, waste monitoring, environmental data — all unified.' },
                { title: 'RFID Asset Tracking',  desc: 'Inventory and asset management with full audit trail.' },
                { title: 'Workforce Scheduling', desc: 'Task Master software for field worker scheduling and task tracking.' },
                { title: 'Smart Energy',         desc: 'EV chargers, solar panels and intelligent lighting management.' },
                { title: 'SmartBin',             desc: 'Solar-powered waste compactors with live telemetry and AI-driven collection routing.' },
              ].map(s => (
                <div key={s.title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 18px', transition: 'border-color 0.2s ease-out' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.blue}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.9rem', fontWeight: 700, color: C.text, marginBottom: 8 }}>{s.title}</div>
                  <div style={{ fontSize: '0.78rem', color: C.sub, lineHeight: 1.65, ...ui }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Deploy & Connect ── */}
      <section style={{ padding: 'clamp(70px,10vw,110px) 40px', background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ ...mono, fontSize: '0.65rem', color: C.blue, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 14 }}>DEPLOYMENT</div>
              <h2 style={{ ...display, fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.03em', margin: '0 0 14px' }}>
                Live in under 5 minutes
              </h2>
              <p style={{ fontSize: '0.92rem', color: C.sub, maxWidth: 480, margin: '0 auto', lineHeight: 1.7, ...ui }}>
                No special hardware, no complex setup. Point the device at our server and it connects automatically.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>

            {/* 3-step setup */}
            <FadeIn direction="left">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { n: '01', title: 'Open device config screen', desc: 'On the HY-CKX1 Android panel, go to Basic Information Configuration.', color: C.blue },
                  { n: '02', title: 'Enter the server endpoint',  desc: 'Set TCP IP to 130.211.208.47 and Port to 8078. Tap SAVE.', color: '#a78bfa' },
                  { n: '03', title: 'Restart and go live',        desc: 'Restart the device app. It handshakes with our server and appears live on the dashboard within seconds.', color: C.green },
                ].map((step, i) => (
                  <div key={step.n} style={{ display: 'flex', gap: 18, padding: '22px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, transition: 'border-color 0.2s ease-out, box-shadow 0.2s ease-out' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = step.color; e.currentTarget.style.boxShadow = `0 4px 24px ${step.color}20` }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: `${step.color}15`, border: `1px solid ${step.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ ...mono, fontSize: '0.78rem', color: step.color, fontWeight: 800 }}>{step.n}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.text, marginBottom: 6, ...ui }}>{step.title}</div>
                      <div style={{ fontSize: '0.8rem', color: C.muted, lineHeight: 1.65, ...ui }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Contact + ready card */}
            <FadeIn direction="right" delay={80}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Ready to connect card */}
                <div style={{ background: 'linear-gradient(135deg, #29ABE2 0%, #1a8bbf 100%)', borderRadius: 18, padding: '32px 28px', color: '#fff' }}>
                  <div style={{ ...display, fontSize: '1.5rem', fontWeight: 800, marginBottom: 12, letterSpacing: '-0.03em' }}>Ready to connect?</div>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.88, margin: '0 0 24px', ...ui }}>
                    Our team will configure the device endpoint and have your first SmartBin live on the dashboard within minutes.
                  </p>
                  <button onClick={scrollToLogin}
                    style={{ background: '#fff', color: '#29ABE2', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: '0.88rem', fontWeight: 700, ...ui, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', transition: 'transform 0.2s ease-out' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    Get started now
                  </button>
                </div>

                {/* Contact card */}
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: '26px 28px', boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: C.text, marginBottom: 20, ...display }}>Contact HandsOn Systems</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                      { label: 'Phone',   value: '(+356) 2722 4445' },
                      { label: 'Email',   value: 'info@handsonsystems.com' },
                      { label: 'Address', value: 'MST26 Mosta Techno Park, Mosta MST 3000, Malta' },
                      { label: 'Web',     value: 'www.handsonsystems.com' },
                    ].map(r => (
                      <div key={r.label} style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: '0.65rem', color: C.muted, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', ...mono }}>{r.label}</span>
                        <span style={{ fontSize: '0.88rem', color: C.sub, ...ui }}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '28px 40px', borderTop: `1px solid ${C.border}`, background: '#080f1a' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <HandsOnBadge iconSize={22} color={C.blue} subColor={C.muted} />
            <div style={{ display: 'flex', gap: 20 }}>
              {['(+356) 2722 4445', 'info@handsonsystems.com', 'Mosta, Malta'].map(t => (
                <span key={t} style={{ fontSize: '0.7rem', color: C.muted, ...ui }}>{t}</span>
              ))}
            </div>
          </div>
          <p style={{ fontSize: '0.7rem', color: C.muted, margin: 0, ...ui }}>
            © {new Date().getFullYear()} HandsOn Systems Ltd. · All rights reserved
          </p>
        </div>
      </footer>
    </div>
  )
}
