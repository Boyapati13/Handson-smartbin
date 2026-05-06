/**
 * Public fault reporting portal — open access, no login required.
 * Members of the public and maintenance staff can report observed faults,
 * suggest improvements, or flag safety issues.
 */
import { useState } from 'react'
import { Send, CheckCircle, MapPin, AlertTriangle, Flame, Trash2, Wrench, MessageSquare } from 'lucide-react'
import { BINS } from '../data/bins'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const REPORT_TYPES = [
  { id:'OVERFLOW',   label:'Bin is full / overflowing',       Icon: Trash2,        color:'#ef4444', desc:'Waste is at or above the collection threshold'     },
  { id:'SMOKE_FIRE', label:'Smoke or fire detected',          Icon: Flame,         color:'#ef4444', desc:'Visible smoke, fire, or burning smell from the bin' },
  { id:'JAM',        label:'Bin mechanism jammed',            Icon: AlertTriangle, color:'#f59e0b', desc:'The compaction flap or motor appears stuck'          },
  { id:'DAMAGE',     label:'Physical damage or vandalism',    Icon: AlertTriangle, color:'#f59e0b', desc:'Bin is damaged, graffitied, or structurally unsafe'  },
  { id:'DOOR_OPEN',  label:'Door open / possible tampering',  Icon: AlertTriangle, color:'#f59e0b', desc:'Service door is open or appears to have been forced' },
  { id:'SUGGESTION', label:'Suggestion or general feedback',  Icon: MessageSquare, color:'#29ABE2', desc:'Improvement ideas or general comments about this bin' },
  { id:'OTHER',      label:'Other issue',                     Icon: Wrench,        color:'#64748b', desc:'Any other problem not covered above'                 },
]

const card = { background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, boxShadow:'0 1px 3px rgba(15,23,42,0.08)' }
const mono = { fontFamily:'IBM Plex Mono, monospace' }

export default function PublicReport() {
  const [step,        setStep]        = useState(1)   // 1: type, 2: bin, 3: details, 4: done
  const [reportType,  setReportType]  = useState(null)
  const [binId,       setBinId]       = useState('')
  const [description, setDescription] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail,setContactEmail]= useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [submitId,    setSubmitId]    = useState(null)
  const [error,       setError]       = useState(null)

  async function handleSubmit() {
    if (!reportType || !description.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${API}/public/report`, {
        method:  'POST',
        headers: { 'Content-Type':'application/json' },
        body:    JSON.stringify({ binId: binId || null, type: reportType.id, description, contactName: contactName || null, contactEmail: contactEmail || null }),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setSubmitId(data.id)
      setStep(4)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setStep(1); setReportType(null); setBinId(''); setDescription(''); setContactName(''); setContactEmail(''); setSubmitId(null); setError(null);
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f0f4f8', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px' }}>
      <div style={{ width:'100%', maxWidth:600 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          {/* Official HandsOn Systems logo */}
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:20, padding:'14px 24px', background:'#fff', borderRadius:12, boxShadow:'0 1px 3px rgba(15,23,42,0.08)', border:'1px solid #e2e8f0' }}>
            <img src="/handson-logo.svg" alt="HandsOn Systems" height={32} style={{ display:'block', objectFit:'contain' }} draggable={false} />
          </div>
          <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.5rem', fontWeight:700, color:'#0f172a', marginBottom:6 }}>
            Report a SmartBin Issue
          </h1>
          <p style={{ color:'#64748b', fontSize:'0.88rem', lineHeight:1.6 }}>
            Malta Smart Bin Network · Help keep our streets clean
          </p>
        </div>

        {/* Step indicator */}
        {step < 4 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:28 }}>
            {['Issue Type','Location','Details'].map((l,i) => {
              const n = i+1
              const done    = step > n
              const current = step === n
              return (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.72rem', fontWeight:700, fontFamily:'IBM Plex Mono, monospace', background: done?'#10b981':current?'#29ABE2':'#e2e8f0', color: (done||current)?'#fff':'#94a3b8', transition:'all 0.2s' }}>
                      {done ? '✓' : n}
                    </div>
                    <span style={{ fontSize:'0.75rem', color: current?'#0f172a':'#94a3b8', fontWeight: current?600:400 }}>{l}</span>
                  </div>
                  {i < 2 && <div style={{ width:24, height:1, background: step>n?'#10b981':'#e2e8f0' }}/>}
                </div>
              )
            })}
          </div>
        )}

        {/* ── Step 1: Issue type ──────────────────────────────────────── */}
        {step === 1 && (
          <div style={{ ...card, padding:'24px' }}>
            <div style={{ fontWeight:600, fontSize:'0.95rem', color:'#0f172a', marginBottom:16 }}>What issue are you reporting?</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {REPORT_TYPES.map(t => (
                <button key={t.id} onClick={() => { setReportType(t); setStep(2) }} style={{
                  display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:10, border:`1.5px solid ${reportType?.id===t.id ? t.color : '#e2e8f0'}`,
                  background: reportType?.id===t.id ? `${t.color}08` : '#fff',
                  cursor:'pointer', textAlign:'left', transition:'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=t.color; e.currentTarget.style.background=`${t.color}06` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=reportType?.id===t.id?t.color:'#e2e8f0'; e.currentTarget.style.background=reportType?.id===t.id?`${t.color}08`:'#fff' }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:`${t.color}12`, border:`1px solid ${t.color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <t.Icon size={17} color={t.color}/>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'0.85rem', color:'#0f172a' }}>{t.label}</div>
                    <div style={{ fontSize:'0.73rem', color:'#64748b', marginTop:2 }}>{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Select bin ──────────────────────────────────────── */}
        {step === 2 && (
          <div style={{ ...card, padding:'24px' }}>
            <button onClick={() => setStep(1)} style={{ ...mono, fontSize:'0.72rem', color:'#29ABE2', background:'none', border:'none', cursor:'pointer', marginBottom:16, padding:0 }}>← Back</button>
            <div style={{ fontWeight:600, fontSize:'0.95rem', color:'#0f172a', marginBottom:4 }}>Which bin is affected?</div>
            <div style={{ fontSize:'0.8rem', color:'#64748b', marginBottom:16 }}>Select the nearest bin or skip if you're unsure.</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
              {BINS.map(b => (
                <button key={b.id} onClick={() => { setBinId(b.id); setStep(3) }} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:10, border:`1.5px solid ${binId===b.id?'#29ABE2':'#e2e8f0'}`, background: binId===b.id?'rgba(41,171,226,0.05)':'#fff', cursor:'pointer', textAlign:'left', transition:'all 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#29ABE2'}
                  onMouseLeave={e => e.currentTarget.style.borderColor=binId===b.id?'#29ABE2':'#e2e8f0'}>
                  <div style={{ width:30, height:30, borderRadius:7, background:'#f0f9ff', border:'1px solid rgba(41,171,226,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <MapPin size={14} color="#29ABE2"/>
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'0.82rem', color:'#0f172a' }}>{b.name}</div>
                    <div style={{ ...mono, fontSize:'0.65rem', color:'#64748b' }}>{b.id} · {b.area}</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => { setBinId(''); setStep(3) }} style={{ width:'100%', padding:'11px', borderRadius:9, border:'1px dashed #cbd5e1', background:'transparent', color:'#94a3b8', fontSize:'0.8rem', cursor:'pointer' }}>
              Skip — I'm not sure which bin
            </button>
          </div>
        )}

        {/* ── Step 3: Details ─────────────────────────────────────────── */}
        {step === 3 && (
          <div style={{ ...card, padding:'24px' }}>
            <button onClick={() => setStep(2)} style={{ ...mono, fontSize:'0.72rem', color:'#29ABE2', background:'none', border:'none', cursor:'pointer', marginBottom:16, padding:0 }}>← Back</button>
            {reportType && (
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:8, background:`${reportType.color}08`, border:`1px solid ${reportType.color}20`, marginBottom:20 }}>
                <reportType.Icon size={15} color={reportType.color}/>
                <span style={{ fontSize:'0.82rem', fontWeight:600, color:reportType.color }}>{reportType.label}</span>
                {binId && <span style={{ ...mono, fontSize:'0.68rem', color:'#64748b', marginLeft:'auto' }}>{binId}</span>}
              </div>
            )}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:'0.78rem', fontWeight:600, color:'#0f172a', marginBottom:6 }}>
                Describe what you observed <span style={{ color:'#ef4444' }}>*</span>
              </label>
              <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} placeholder="Provide as much detail as possible — what you saw, when it happened, any safety concerns…"
                style={{ width:'100%', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 12px', color:'#0f172a', fontSize:'0.82rem', resize:'vertical', outline:'none', fontFamily:'Figtree, sans-serif', boxSizing:'border-box' }}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              <div>
                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'#0f172a', marginBottom:5 }}>Your name (optional)</label>
                <input value={contactName} onChange={e=>setContactName(e.target.value)} placeholder="Anonymous" style={{ width:'100%', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:7, padding:'9px 11px', color:'#0f172a', fontSize:'0.82rem', outline:'none', boxSizing:'border-box' }}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'#0f172a', marginBottom:5 }}>Email (optional)</label>
                <input value={contactEmail} onChange={e=>setContactEmail(e.target.value)} type="email" placeholder="for follow-up only" style={{ width:'100%', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:7, padding:'9px 11px', color:'#0f172a', fontSize:'0.82rem', outline:'none', boxSizing:'border-box' }}/>
              </div>
            </div>
            {error && <div style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:7, padding:'10px 14px', marginBottom:14, fontSize:'0.78rem', color:'#ef4444' }}>{error}</div>}
            <button onClick={handleSubmit} disabled={!description.trim() || submitting} style={{
              width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              background: description.trim() ? '#29ABE2' : '#e2e8f0',
              color:      description.trim() ? '#fff'    : '#94a3b8',
              fontFamily:'Figtree, sans-serif', fontWeight:700, fontSize:'0.88rem',
              padding:'13px', borderRadius:9, border:'none', cursor: description.trim()?'pointer':'default',
              boxShadow: description.trim()?'0 4px 14px rgba(41,171,226,0.35)':'none',
              transition:'all 0.2s',
            }}>
              <Send size={15} strokeWidth={2.5}/>
              {submitting ? 'Submitting…' : 'Submit Report'}
            </button>
            <p style={{ textAlign:'center', fontSize:'0.72rem', color:'#94a3b8', marginTop:12 }}>
              Your report will be reviewed by the HandsOn SmartBin operations team. Personal data is handled per GDPR.
            </p>
          </div>
        )}

        {/* ── Step 4: Confirmation ─────────────────────────────────────── */}
        {step === 4 && (
          <div style={{ ...card, padding:'40px 24px', textAlign:'center' }}>
            <div style={{ width:60, height:60, borderRadius:16, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
              <CheckCircle size={28} color="#10b981"/>
            </div>
            <h2 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.2rem', fontWeight:700, color:'#0f172a', marginBottom:8 }}>
              Report received
            </h2>
            <p style={{ color:'#64748b', fontSize:'0.85rem', marginBottom:8 }}>
              Thank you for helping keep Malta clean. Our operations team has been notified.
            </p>
            {submitId && (
              <div style={{ ...mono, fontSize:'0.68rem', color:'#94a3b8', marginBottom:20 }}>
                Reference: #{String(submitId).slice(-8).toUpperCase()}
              </div>
            )}
            <button onClick={reset} style={{ background:'#29ABE2', color:'#fff', fontFamily:'Figtree, sans-serif', fontWeight:600, fontSize:'0.82rem', padding:'11px 24px', borderRadius:8, border:'none', cursor:'pointer', boxShadow:'0 4px 14px rgba(41,171,226,0.3)' }}>
              Report another issue
            </button>
          </div>
        )}

        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginTop:20 }}>
          <img src="/handson-logo.svg" alt="HandsOn" height={14} style={{ opacity:0.35, objectFit:'contain' }} draggable={false} />
          <span style={{ fontSize:'0.72rem', color:'#94a3b8' }}>EcoDisposer HY-CKX1 · Malta Smart Waste Network</span>
        </div>
      </div>
    </div>
  )
}
