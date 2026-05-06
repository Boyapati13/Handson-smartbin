import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Wrench, Plus, Calendar, User, Package, ChevronRight, CheckCircle, Clock, Filter, ExternalLink } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useApi, useMutation } from '../hooks/useApi'
import StatusBadge from '../components/StatusBadge'

const card = { background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, boxShadow:'var(--shadow)' }
const mono = { fontFamily:'IBM Plex Mono, monospace' }
const lbl  = { fontSize:'0.62rem', ...mono, color:'var(--muted)', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:6 }

const VISIT_TYPES = [
  { id:'routine',    label:'Routine Service',   color:'var(--blue)'    },
  { id:'repair',     label:'Repair / Fix',      color:'var(--amber)'   },
  { id:'emergency',  label:'Emergency Call-Out', color:'var(--crimson)' },
  { id:'inspection', label:'Inspection',        color:'var(--green)'   },
  { id:'parts',      label:'Parts Replacement', color:'var(--sub)'     },
]

export default function Maintenance() {
  const { bins } = useApp()
  const { data: logs, loading, refetch } = useApi('/maintenance')
  const { data: pubReports, refetch: refetchPub } = useApi('/public/reports')
  const { mutate } = useMutation('/maintenance')

  const [showForm,    setShowForm]    = useState(false)
  const [filterBin,   setFilterBin]   = useState('all')
  const [filterType,  setFilterType]  = useState('all')

  // Form state
  const [form, setForm] = useState({ binId:'', technician:'', workDone:'', partsReplaced:'', nextScheduled:'', visitDate: new Date().toISOString().slice(0,10), type:'routine' })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  async function handleSave() {
    if (!form.binId || !form.workDone.trim()) return
    setSaving(true)
    try {
      await mutate(form)
      setSaved(true)
      setForm({ binId:'', technician:'', workDone:'', partsReplaced:'', nextScheduled:'', visitDate: new Date().toISOString().slice(0,10), type:'routine' })
      setTimeout(() => { setSaved(false); setShowForm(false); refetch() }, 1500)
    } catch { /* toast shown by server */ }
    finally { setSaving(false) }
  }

  const allLogs = logs || []
  const filtered = allLogs.filter(l =>
    (filterBin  === 'all' || l.binId  === filterBin)  &&
    (filterType === 'all' || l.type   === filterType)
  )

  const Input = ({ label, value, onChange, type='text', placeholder='', required=false }) => (
    <div>
      <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'var(--text)', marginBottom:5 }}>
        {label}{required && <span style={{ color:'var(--crimson)' }}> *</span>}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} style={{ width:'100%', background:'var(--raised)', border:'1px solid var(--border2)', borderRadius:7, padding:'9px 12px', color:'var(--text)', fontSize:'0.82rem', outline:'none', boxSizing:'border-box', fontFamily:'Figtree, sans-serif' }}
        onFocus={e=>e.currentTarget.style.borderColor='var(--blue)'}
        onBlur={e=>e.currentTarget.style.borderColor='var(--border2)'}
      />
    </div>
  )

  return (
    <div style={{ padding:'28px 32px', animation:'slideUp 0.3s ease both' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.65rem', fontWeight:700, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:4 }}>
            Maintenance
          </h1>
          <div style={{ ...mono, fontSize:'0.7rem', color:'var(--sub)' }}>
            Service logs · {allLogs.length} visits recorded · {(pubReports||[]).length} public reports
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <Link to="/public-report" target="_blank" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:8, border:'1px solid var(--border2)', color:'var(--sub)', textDecoration:'none', fontSize:'0.8rem', fontFamily:'Figtree, sans-serif', transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--blue)';e.currentTarget.style.color='var(--blue)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.color='var(--sub)'}}>
            <ExternalLink size={13}/>
            Public Portal
          </Link>
          <button onClick={()=>setShowForm(!showForm)} style={{ display:'inline-flex', alignItems:'center', gap:7, background:'var(--blue)', color:'#fff', fontFamily:'Figtree, sans-serif', fontWeight:600, fontSize:'0.82rem', padding:'9px 18px', borderRadius:8, border:'none', cursor:'pointer', boxShadow:'0 4px 12px rgba(41,171,226,0.3)' }}>
            <Plus size={14} strokeWidth={2.5}/>
            Log Visit
          </button>
        </div>
      </div>

      {/* Log visit form */}
      {showForm && (
        <div style={{ ...card, padding:'24px', marginBottom:20, borderColor:'rgba(41,171,226,0.2)', background:'linear-gradient(135deg,#fff 0%,#f0f9ff 100%)' }}>
          <div style={{ fontWeight:600, fontSize:'0.95rem', color:'var(--text)', marginBottom:20 }}>New Maintenance Visit</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <div>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'var(--text)', marginBottom:5 }}>Unit <span style={{ color:'var(--crimson)' }}>*</span></label>
              <select value={form.binId} onChange={e=>setForm({...form,binId:e.target.value})} style={{ width:'100%', background:'var(--raised)', border:'1px solid var(--border2)', borderRadius:7, padding:'9px 12px', color:'var(--text)', fontSize:'0.82rem', cursor:'pointer', boxSizing:'border-box' }}>
                <option value="">Select unit…</option>
                {bins.map(b=><option key={b.id} value={b.id}>{b.id} — {b.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'var(--text)', marginBottom:5 }}>Visit type</label>
              <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{ width:'100%', background:'var(--raised)', border:'1px solid var(--border2)', borderRadius:7, padding:'9px 12px', color:'var(--text)', fontSize:'0.82rem', cursor:'pointer', boxSizing:'border-box' }}>
                {VISIT_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <Input label="Technician" value={form.technician} onChange={e=>setForm({...form,technician:e.target.value})} placeholder="Name or employee ID"/>
            <Input label="Visit date" type="date" value={form.visitDate} onChange={e=>setForm({...form,visitDate:e.target.value})} required/>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'var(--text)', marginBottom:5 }}>Work carried out <span style={{ color:'var(--crimson)' }}>*</span></label>
            <textarea value={form.workDone} onChange={e=>setForm({...form,workDone:e.target.value})} rows={3} placeholder="Describe all work performed, observations, and outcomes…" style={{ width:'100%', background:'var(--raised)', border:'1px solid var(--border2)', borderRadius:7, padding:'10px 12px', color:'var(--text)', fontSize:'0.82rem', resize:'vertical', outline:'none', fontFamily:'Figtree, sans-serif', boxSizing:'border-box' }}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
            <Input label="Parts replaced" value={form.partsReplaced} onChange={e=>setForm({...form,partsReplaced:e.target.value})} placeholder="e.g. Compaction motor, sensor"/>
            <Input label="Next scheduled visit" type="date" value={form.nextScheduled} onChange={e=>setForm({...form,nextScheduled:e.target.value})}/>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button onClick={()=>setShowForm(false)} style={{ background:'transparent', border:'1px solid var(--border2)', color:'var(--sub)', fontFamily:'Figtree, sans-serif', fontSize:'0.82rem', padding:'9px 18px', borderRadius:8, cursor:'pointer' }}>Cancel</button>
            <button onClick={handleSave} disabled={!form.binId||!form.workDone.trim()||saving} style={{ display:'inline-flex', alignItems:'center', gap:7, background: form.binId&&form.workDone.trim()?'var(--blue)':'var(--raised)', color: form.binId&&form.workDone.trim()?'#fff':'var(--muted)', fontFamily:'Figtree, sans-serif', fontWeight:600, fontSize:'0.82rem', padding:'9px 18px', borderRadius:8, border:'none', cursor: form.binId&&form.workDone.trim()?'pointer':'default', boxShadow: form.binId&&form.workDone.trim()?'0 4px 12px rgba(41,171,226,0.3)':'none' }}>
              {saved ? <><CheckCircle size={14}/> Saved!</> : saving ? 'Saving…' : <><CheckCircle size={14}/> Save Log</>}
            </button>
          </div>
        </div>
      )}

      {/* Public reports pending review */}
      {(pubReports||[]).filter(r=>r.status==='pending').length > 0 && (
        <div style={{ ...card, marginBottom:20, overflow:'hidden', borderColor:'rgba(245,158,11,0.3)' }}>
          <div style={{ padding:'12px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(245,158,11,0.04)' }}>
            <span style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--text)' }}>Public Reports — Pending Review</span>
            <span style={{ ...mono, fontSize:'0.62rem', color:'var(--amber)', fontWeight:700 }}>{(pubReports||[]).filter(r=>r.status==='pending').length} PENDING</span>
          </div>
          {(pubReports||[]).filter(r=>r.status==='pending').slice(0,5).map(r => (
            <div key={r.id} style={{ padding:'12px 18px', borderBottom:'1px solid var(--ink)', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ ...mono, fontSize:'0.65rem', fontWeight:700, color:'var(--amber)', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', padding:'2px 7px', borderRadius:4 }}>{r.type}</span>
                  {r.binId && <span style={{ ...mono, fontSize:'0.62rem', color:'var(--blue)' }}>{r.binId}</span>}
                  <span style={{ fontSize:'0.68rem', color:'var(--muted)' }}>{r.receivedAt}</span>
                </div>
                <div style={{ fontSize:'0.78rem', color:'var(--text)' }}>{r.description}</div>
                {r.contactName && r.contactName !== 'Anonymous' && (
                  <div style={{ fontSize:'0.68rem', color:'var(--sub)', marginTop:2 }}>Reported by: {r.contactName}</div>
                )}
              </div>
              <button onClick={async () => { await fetch(`${import.meta.env.VITE_API_URL||'http://localhost:3001/api'}/public/reports/${r.id}`, {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'reviewed'})}); refetchPub() }}
                style={{ ...mono, fontSize:'0.68rem', color:'var(--green)', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:6, padding:'5px 10px', cursor:'pointer' }}>
                Mark reviewed
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <Filter size={14} color="var(--sub)"/>
        <select value={filterBin} onChange={e=>setFilterBin(e.target.value)} style={{ ...mono, fontSize:'0.72rem', background:'var(--card)', border:'1px solid var(--border2)', borderRadius:7, padding:'7px 10px', color:'var(--text)', cursor:'pointer' }}>
          <option value="all">All units</option>
          {bins.map(b=><option key={b.id} value={b.id}>{b.id} — {b.name}</option>)}
        </select>
        <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ ...mono, fontSize:'0.72rem', background:'var(--card)', border:'1px solid var(--border2)', borderRadius:7, padding:'7px 10px', color:'var(--text)', cursor:'pointer' }}>
          <option value="all">All types</option>
          {VISIT_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <span style={{ ...mono, fontSize:'0.62rem', color:'var(--muted)', marginLeft:'auto' }}>{filtered.length} RECORDS</span>
      </div>

      {/* Maintenance log table */}
      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--sub)', ...mono, fontSize:'0.78rem' }}>Loading maintenance logs…</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, padding:'60px 40px', textAlign:'center' }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'var(--ink)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <Wrench size={22} color="var(--muted)"/>
          </div>
          <div style={{ fontFamily:'Syne, sans-serif', fontSize:'1rem', fontWeight:600, color:'var(--text)', marginBottom:8 }}>No maintenance logs yet</div>
          <div style={{ fontSize:'0.82rem', color:'var(--sub)' }}>Log your first visit using the button above.</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map(log => {
            const typeInfo = VISIT_TYPES.find(t=>t.id===log.type) || { label:log.type, color:'var(--sub)' }
            const bin      = bins.find(b=>b.id===log.binId)
            return (
              <div key={log.id} style={{ ...card, padding:'18px 20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, flexWrap:'wrap' }}>
                      <span style={{ ...mono, fontSize:'0.65rem', fontWeight:700, color:typeInfo.color, background:`${typeInfo.color === 'var(--blue)' ? 'rgba(41,171,226' : typeInfo.color === 'var(--amber)' ? 'rgba(245,158,11' : typeInfo.color === 'var(--crimson)' ? 'rgba(239,68,68' : 'rgba(100,116,139'},.1)`, border:`1px solid ${typeInfo.color === 'var(--blue)' ? 'rgba(41,171,226' : typeInfo.color === 'var(--amber)' ? 'rgba(245,158,11' : typeInfo.color === 'var(--crimson)' ? 'rgba(239,68,68' : 'rgba(100,116,139'},.2)`, padding:'2px 8px', borderRadius:4 }}>
                        {typeInfo.label.toUpperCase()}
                      </span>
                      <Link to={`/fleet/${log.binId}`} style={{ ...mono, fontSize:'0.7rem', color:'var(--blue)', fontWeight:700, textDecoration:'none' }}>{log.binId}</Link>
                      <span style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--text)' }}>{log.binName}</span>
                      {bin && <StatusBadge status={bin.status}/>}
                    </div>
                    <div style={{ fontSize:'0.82rem', color:'var(--text)', marginBottom:6 }}>{log.workDone}</div>
                    {log.partsReplaced && log.partsReplaced !== 'None' && (
                      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.72rem', color:'var(--sub)', marginBottom:4 }}>
                        <Package size={11} color="var(--muted)"/>
                        Parts: {log.partsReplaced}
                      </div>
                    )}
                    <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginTop:6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.7rem', color:'var(--sub)' }}>
                        <Calendar size={11} color="var(--muted)"/>
                        <span>{log.visitDate}</span>
                      </div>
                      {log.technician && (
                        <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.7rem', color:'var(--sub)' }}>
                          <User size={11} color="var(--muted)"/>
                          <span>{log.technician}</span>
                        </div>
                      )}
                      {log.nextScheduled && (
                        <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.7rem', color:'var(--blue)' }}>
                          <Clock size={11}/>
                          <span>Next: {log.nextScheduled}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ ...mono, fontSize:'0.62rem', color:'var(--muted)', flexShrink:0 }}>{log.createdAt}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
