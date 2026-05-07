import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Bot, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { fillColor, statusMap } from '../data/bins'

const mono = { fontFamily: 'IBM Plex Mono, monospace' }

/* ── Query processor ─────────────────────────────────────────────────────── */
function resolveBin(q, bins) {
  // Match "1", "bin 1", "HS-001", "#1", "unit 1"
  const m = q.match(/\b(?:hs-?0*(\d+)|bin\s*(\d+)|unit\s*(\d+)|#(\d+)|^(\d+)$)\b/i)
  if (!m) return null
  const n = parseInt(m[1] || m[2] || m[3] || m[4] || m[5])
  return bins.find(b => b.id === `HS-${String(n).padStart(3, '0')}`) || bins[n - 1] || null
}

function statusLabel(b) {
  return statusMap[b.status]?.label || b.status
}

function batteryBar(pct) {
  const filled = Math.round(pct / 10)
  return '█'.repeat(filled) + '░'.repeat(10 - filled) + ` ${pct}%`
}

function fillBar(pct) {
  const filled = Math.round(pct / 10)
  return '█'.repeat(filled) + '░'.repeat(10 - filled) + ` ${pct}%`
}

function processQuery(raw, bins, alerts, isDemo) {
  const q = raw.toLowerCase().trim()

  // ── Greetings ────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|hiya|good\s?(morning|afternoon|evening))/.test(q)) {
    return {
      text: `Hi! I'm the SmartBin assistant. I can answer questions about any bin in your fleet${isDemo ? ' (8 Malta units)' : ''}.\n\nTry:\n• **"Status of bin 1"**\n• **"Fill level of HS-002"**\n• **"Which bins need collection?"**\n• **"Show alerts"**\n• **"Fleet overview"**`,
    }
  }

  // ── Help ─────────────────────────────────────────────────────────────────
  if (/help|what can|commands|options/.test(q)) {
    const binList = bins.map(b => `${b.id}`).join(', ')
    return {
      text: `**Available commands:**\n\n🔍 **Bin queries** — Ask about any bin by number:\n• "Status of bin 1" / "HS-001 status"\n• "Fill level of bin 2"\n• "Battery of HS-004"\n• "Temperature of bin 3"\n• "Alerts for bin 1"\n• "Compactions bin 2"\n\n📊 **Fleet queries:**\n• "Fleet overview"\n• "Which bins need collection?"\n• "Show all alerts"\n• "Offline bins"\n\n**Available bins:** ${binList}`,
    }
  }

  // ── Specific bin query ────────────────────────────────────────────────────
  const bin = resolveBin(q, bins)
  if (bin) {
    const binAlerts = alerts.filter(a => a.bin === bin.id)

    if (/fill|capac|level|full|percent/.test(q)) {
      const state = bin.fill >= 90 ? '🔴 CRITICAL — collect immediately' : bin.fill >= 70 ? '🟡 High — schedule collection' : '🟢 Normal'
      return {
        text: `**${bin.id} — Fill Level**\n\n${fillBar(Math.round(bin.fill))}\n\n${state}\n\nBin: **${bin.name}** (${bin.area})\nStatus: **${statusLabel(bin)}**${bin.seen ? `\nLast seen: ${bin.seen} ago` : ''}`,
        metric: { label: 'Fill', value: `${Math.round(bin.fill)}%`, color: fillColor(bin.fill) },
      }
    }

    if (/batter|solar|power|charge|volt/.test(q)) {
      const state = bin.battery < 20 ? '🔴 CRITICAL — solar check needed' : bin.battery < 40 ? '🟡 Low — monitor' : '🟢 Charging normally'
      return {
        text: `**${bin.id} — Battery**\n\n${batteryBar(Math.round(bin.battery))}\n\n${state}\n\nBin: **${bin.name}**${bin.batteryVoltage ? `\nVoltage: **${bin.batteryVoltage}V**` : ''}${bin.batteryCurrent !== undefined ? `\nCurrent: **${bin.batteryCurrent}A**` : ''}`,
        metric: { label: 'Battery', value: `${Math.round(bin.battery)}%`, color: bin.battery < 20 ? '#ef4444' : bin.battery < 40 ? '#f59e0b' : '#10b981' },
      }
    }

    if (/temp|heat|hot|cold|celsius/.test(q)) {
      const state = bin.temp > 50 ? '🔴 Overheating' : bin.temp > 35 ? '🟡 Warm' : bin.temp > 0 ? '🟢 Normal' : '⚫ No reading'
      return {
        text: `**${bin.id} — Temperature**\n\nReading: **${bin.temp > 0 ? bin.temp + '°C' : '—'}**\n${state}\n\nBin: **${bin.name}** (${bin.area})`,
        metric: { label: 'Temp', value: bin.temp > 0 ? `${bin.temp}°C` : '—', color: bin.temp > 50 ? '#ef4444' : '#29ABE2' },
      }
    }

    if (/alert|alarm|warn|fault|smoke|jam/.test(q)) {
      if (binAlerts.length === 0) {
        return { text: `**${bin.id} — Alerts**\n\n✅ No active alerts for **${bin.name}**.\n\nStatus: **${statusLabel(bin)}** — all systems normal.` }
      }
      const lines = binAlerts.map(a => `• **${a.type}** — ${a.msg}`).join('\n')
      return { text: `**${bin.id} — Active Alerts** (${binAlerts.length})\n\n${lines}\n\nBin: **${bin.name}** (${bin.area})` }
    }

    if (/compact|cycle|count|compress|open/.test(q)) {
      return {
        text: `**${bin.id} — Usage Counts**\n\nCompactions: **${bin.cycles ?? 0}** total${bin.compactionCounts ? `\nDoor 1: **${bin.compactionCounts[0]}** · Door 2: **${bin.compactionCounts[1]}** · Door 3: **${bin.compactionCounts[2]}**` : ''}${bin.openCounts ? `\nDoor opens: **${bin.openCounts[0]}**/**${bin.openCounts[1]}**/**${bin.openCounts[2]}**` : ''}\n\nBin: **${bin.name}** (${bin.area})`,
        metric: { label: 'Cycles', value: String(bin.cycles ?? 0), color: '#29ABE2' },
      }
    }

    if (/location|gps|where|coord|lat|lng/.test(q)) {
      const hasGps = bin.lat != null && bin.lng != null
      return {
        text: `**${bin.id} — Location**\n\n${hasGps ? `📍 **${bin.lastLocation || `${bin.lat?.toFixed(4)}, ${bin.lng?.toFixed(4)}`}**\nLat: ${bin.lat?.toFixed(6)}\nLng: ${bin.lng?.toFixed(6)}` : '📍 No GPS fix yet — waiting for device to send frame 0x10'}\n\nBin: **${bin.name}** (${bin.area})`,
      }
    }

    // Default: full bin summary
    const alertTag = binAlerts.length > 0 ? ` ⚠️ ${binAlerts.length} alert${binAlerts.length > 1 ? 's' : ''}` : ''
    return {
      text: `**${bin.id} — ${bin.name}**${alertTag}\n\nFill:    ${fillBar(Math.round(bin.fill))}\nBattery: ${batteryBar(Math.round(bin.battery))}\nTemp:    **${bin.temp > 0 ? bin.temp + '°C' : '—'}**\nStatus:  **${statusLabel(bin)}**\nCycles:  **${bin.cycles ?? 0}**\nSignal:  **${bin.signal ?? 0}/4**\nArea:    ${bin.area}${bin.seen ? `\nSeen:    ${bin.seen} ago` : ''}${binAlerts.length ? `\n\n🚨 Alerts:\n${binAlerts.map(a => `• ${a.type}: ${a.msg}`).join('\n')}` : ''}`,
      metric: { label: 'Fill', value: `${Math.round(bin.fill)}%`, color: fillColor(bin.fill) },
    }
  }

  // ── Fleet queries ─────────────────────────────────────────────────────────
  if (/collection|pickup|need|queue|ready|urgent/.test(q)) {
    const overdue = bins.filter(b => b.fill >= 80 && b.status !== 'offline')
    if (overdue.length === 0) return { text: '✅ **No bins need collection right now.**\n\nAll bins are below the 80% threshold.' }
    const list = overdue.sort((a, b) => b.fill - a.fill).map(b => `• **${b.id}** — ${Math.round(b.fill)}% — ${b.name}`).join('\n')
    return { text: `**Bins Needing Collection** (${overdue.length})\n\n${list}\n\nSorted by fill level — highest first.` }
  }

  if (/offline|disconnect|lost|down/.test(q)) {
    const offline = bins.filter(b => b.status === 'offline')
    if (offline.length === 0) return { text: '✅ **All bins are online.**' }
    const list = offline.map(b => `• **${b.id}** — ${b.name} (${b.area})`).join('\n')
    return { text: `**Offline Bins** (${offline.length})\n\n${list}` }
  }

  if (/alert|alarm|warn/.test(q)) {
    if (alerts.length === 0) return { text: '✅ **No active alerts** across the fleet.' }
    const list = alerts.slice(0, 8).map(a => `• **${a.bin}** — ${a.type} — ${a.msg}`).join('\n')
    const extra = alerts.length > 8 ? `\n…and ${alerts.length - 8} more` : ''
    return { text: `**Active Alerts** (${alerts.length})\n\n${list}${extra}` }
  }

  if (/fleet|overview|summary|all bins|status/.test(q)) {
    const online  = bins.filter(b => b.status !== 'offline').length
    const full    = bins.filter(b => b.fill >= 80).length
    const avgFill = Math.round(bins.reduce((s, b) => s + b.fill, 0) / bins.length)
    const list    = bins.map(b => `• **${b.id}** ${String(Math.round(b.fill)).padStart(3)}% ${statusLabel(b)} — ${b.name}`).join('\n')
    return {
      text: `**Fleet Overview** — ${bins.length} units\n\nOnline: **${online}/${bins.length}** · Avg Fill: **${avgFill}%** · Need collection: **${full}**\n\n${list}`,
    }
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  return {
    text: `I didn't understand that. Try:\n• **"Status of bin 1"** — full summary\n• **"Fill level of HS-002"** — capacity\n• **"Battery bin 3"** — power state\n• **"Which bins need collection?"**\n• **"Show alerts"**\n• **"Fleet overview"**`,
  }
}

/* ── Markdown-lite renderer ───────────────────────────────────────────────── */
function renderText(text) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    return (
      <div key={i} style={{ marginBottom: line === '' ? 6 : 2, lineHeight: 1.55 }}>
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j} style={{ color: '#f1f5f9', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
            : <span key={j}>{part}</span>
        )}
      </div>
    )
  })
}

/* ── Suggested chips ─────────────────────────────────────────────────────── */
const SUGGESTIONS = [
  'Status of bin 1',
  'Fill level of bin 2',
  'Which bins need collection?',
  'Show all alerts',
  'Fleet overview',
  'Battery of bin 1',
]

/* ── Bot message bubble ───────────────────────────────────────────────────── */
function BotMsg({ msg }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 14 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(41,171,226,0.15)', border: '1px solid rgba(41,171,226,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        <Bot size={14} color="#29ABE2" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '4px 12px 12px 12px', padding: '10px 14px', fontSize: '0.78rem', color: '#94a3b8', ...mono }}>
          {renderText(msg.text)}
        </div>
        {msg.metric && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 6, background: 'rgba(15,23,42,0.8)', border: `1px solid ${msg.metric.color}40`, borderRadius: 8, padding: '6px 12px' }}>
            <span style={{ fontSize: '0.65rem', color: '#64748b', ...mono }}>{msg.metric.label.toUpperCase()}</span>
            <span style={{ ...mono, fontSize: '1.1rem', fontWeight: 700, color: msg.metric.color }}>{msg.metric.value}</span>
          </div>
        )}
        <div style={{ ...mono, fontSize: '0.58rem', color: '#475569', marginTop: 4 }}>{msg.ts}</div>
      </div>
    </div>
  )
}

/* ── User message bubble ──────────────────────────────────────────────────── */
function UserMsg({ msg }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
      <div style={{ maxWidth: '80%' }}>
        <div style={{ background: '#29ABE2', borderRadius: '12px 4px 12px 12px', padding: '9px 14px', fontSize: '0.78rem', color: '#fff', fontWeight: 500, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {msg.text}
        </div>
        <div style={{ ...mono, fontSize: '0.58rem', color: '#475569', marginTop: 4, textAlign: 'right' }}>{msg.ts}</div>
      </div>
    </div>
  )
}

/* ── Main ChatBot component ───────────────────────────────────────────────── */
export default function ChatBot() {
  const { bins, alerts, isDemo } = useApp()
  const [open,     setOpen]     = useState(false)
  const [input,    setInput]    = useState('')
  const [messages, setMessages] = useState([
    {
      id: 0, role: 'bot', ts: now(),
      text: `Hello! I'm your SmartBin assistant 👋\n\nAsk me about any bin — fill levels, battery, alerts, compactions, and more.\n\nTry: **"Status of bin 1"** or **"Which bins need collection?"**`,
    },
  ])
  const [typing,   setTyping]   = useState(false)
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const idRef      = useRef(1)

  const critAlerts = alerts.filter(a => a.sev === 'crit').length

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const send = useCallback((text) => {
    const q = (text || input).trim()
    if (!q) return
    setInput('')

    const userMsg = { id: idRef.current++, role: 'user', text: q, ts: now() }
    setMessages(prev => [...prev, userMsg])
    setTyping(true)

    // Simulate a brief "thinking" delay for realism
    setTimeout(() => {
      const result = processQuery(q, bins, alerts, isDemo)
      const botMsg = { id: idRef.current++, role: 'bot', ts: now(), ...result }
      setMessages(prev => [...prev, botMsg])
      setTyping(false)
    }, 420)
  }, [input, bins, alerts, isDemo])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* ── Chat panel ───────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 88, right: 24, width: 380,
        background: '#0f172a', border: '1px solid #1e293b',
        borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column',
        height: open ? 540 : 0, overflow: 'hidden',
        opacity: open ? 1 : 0,
        transition: 'height 0.3s ease-out, opacity 0.25s ease-out',
        zIndex: 200,
      }}>
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(41,171,226,0.12)', border: '1px solid rgba(41,171,226,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={17} color="#29ABE2" />
            </div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>SmartBin Assistant</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981', animation: 'breathe 1.2s ease-in-out infinite' }} />
                <span style={{ ...mono, fontSize: '0.6rem', color: '#10b981' }}>ONLINE · {isDemo ? 'DEMO' : 'LIVE'}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close chat"
            style={{ background: 'none', border: '1px solid #1e293b', color: '#64748b', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s ease-out' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b' }}>
            <X size={14} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', scrollbarWidth: 'thin', scrollbarColor: '#1e293b #0f172a' }}>
          {messages.map(msg =>
            msg.role === 'bot'
              ? <BotMsg key={msg.id} msg={msg} />
              : <UserMsg key={msg.id} msg={msg} />
          )}
          {typing && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(41,171,226,0.15)', border: '1px solid rgba(41,171,226,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={14} color="#29ABE2" />
              </div>
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '4px 12px 12px 12px', padding: '10px 14px', display: 'flex', gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#29ABE2', animation: `breathe 1s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips */}
        {messages.length <= 2 && !typing && (
          <div style={{ padding: '0 14px 10px', display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
            {SUGGESTIONS.slice(0, isDemo ? 6 : 4).map(s => (
              <button key={s} onClick={() => send(s)}
                style={{ ...mono, fontSize: '0.62rem', color: '#29ABE2', background: 'rgba(41,171,226,0.08)', border: '1px solid rgba(41,171,226,0.2)', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', transition: 'all 0.2s ease-out', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(41,171,226,0.18)'; e.currentTarget.style.borderColor = 'rgba(41,171,226,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(41,171,226,0.08)'; e.currentTarget.style.borderColor = 'rgba(41,171,226,0.2)' }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '10px 14px 14px', borderTop: '1px solid #1e293b', display: 'flex', gap: 8, flexShrink: 0, background: '#0a1120' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about any bin…"
            style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '9px 14px', color: '#f1f5f9', fontSize: '0.82rem', fontFamily: 'Plus Jakarta Sans, sans-serif', outline: 'none', transition: 'border-color 0.2s ease-out' }}
            onFocus={e => e.target.style.borderColor = '#29ABE2'}
            onBlur={e => e.target.style.borderColor = '#334155'}
          />
          <button onClick={() => send()} aria-label="Send message" disabled={!input.trim()}
            style={{ width: 38, height: 38, borderRadius: 10, background: input.trim() ? '#29ABE2' : '#1e293b', border: `1px solid ${input.trim() ? '#29ABE2' : '#334155'}`, color: '#fff', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease-out', flexShrink: 0 }}>
            <Send size={15} />
          </button>
        </div>
      </div>

      {/* ── Floating button ───────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close assistant' : 'Open SmartBin assistant'}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 200,
          width: 54, height: 54, borderRadius: 16,
          background: open ? '#1e293b' : '#29ABE2',
          border: open ? '1px solid #334155' : '1px solid rgba(41,171,226,0.5)',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: open ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 24px rgba(41,171,226,0.5)',
          transition: 'all 0.25s ease-out',
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 30px rgba(41,171,226,0.7)' } }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = open ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 24px rgba(41,171,226,0.5)' }}>
        {open ? <ChevronDown size={20} /> : <MessageCircle size={21} />}
        {/* Alert badge */}
        {!open && critAlerts > 0 && (
          <div style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', border: '2px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ ...mono, fontSize: '0.55rem', color: '#fff', fontWeight: 700 }}>{critAlerts}</span>
          </div>
        )}
      </button>
    </>
  )
}

function now() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
