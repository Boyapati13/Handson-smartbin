import { BINS, WEEK_DATA, fillColor, statusMap } from '../data/bins'
import FillBar from '../components/FillBar'

const S = { card:{background:'#0b1120',border:'1px solid #131e35',borderRadius:10}, mono:{fontFamily:'IBM Plex Mono,monospace'}, label:{fontSize:'0.62rem',fontFamily:'IBM Plex Mono,monospace',color:'#3a4a64',letterSpacing:'0.07em',textTransform:'uppercase',marginBottom:6} }

export default function Analytics() {
  const maxV = Math.max(...WEEK_DATA.map(d=>d.v))
  const avgV = Math.round(WEEK_DATA.reduce((s,d)=>s+d.v,0)/WEEK_DATA.length)

  return (
    <div style={{padding:'28px 32px',animation:'slideUp 0.35s ease both'}}>
      <div style={{marginBottom:24}}>
        <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'1.7rem',fontWeight:700,color:'#f0f4ff',letterSpacing:'-0.02em',marginBottom:4}}>Analytics</h1>
        <div style={{...S.mono,fontSize:'0.7rem',color:'#5a6b8a'}}>Fleet performance · rolling 7 days</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12,marginBottom:20}}>
        {[['Avg Fill','71%','Weekly avg','#8fff00'],['Collections','12','This week','#38bdf8'],
          ['Compactions',BINS.reduce((s,b)=>s+b.cycles,0),'All units today','#5a6b8a'],
          ['Uptime','87.5%','Network availability','#8fff00'],
          ['Route Savings','28%','vs. fixed schedule','#ffb347'],['CO₂ Saved','~41 kg','vs. weekly routes','#38bdf8']].map(([l,v,n,c])=>(
          <div key={l} style={{...S.card,padding:'16px 18px'}}>
            <div style={S.label}>{l}</div>
            <div style={{...S.mono,fontSize:'1.7rem',fontWeight:600,color:c,lineHeight:1,marginBottom:4}}>{v}</div>
            <div style={{fontSize:'0.68rem',color:'#3a4a64'}}>{n}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        {/* Fill trend */}
        <div style={{...S.card,padding:'20px'}}>
          <div style={{fontSize:'0.85rem',fontWeight:600,color:'#f0f4ff',marginBottom:4}}>Fill Level Trend</div>
          <div style={{...S.mono,fontSize:'0.62rem',color:'#5a6b8a',marginBottom:16}}>AVG % · LAST 7 DAYS</div>
          <div style={{position:'relative',height:140}}>
            <svg width="100%" height="140" viewBox="0 0 300 140" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8fff00" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#8fff00" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {[25,50,75,100].map(v=>(
                <line key={v} x1="0" y1={140-(v/100)*120} x2="300" y2={140-(v/100)*120} stroke="#131e35" strokeWidth="1" strokeDasharray="4 4"/>
              ))}
              <polygon points={`0,140 ${WEEK_DATA.map((d,i)=>`${(i/(WEEK_DATA.length-1))*300},${140-(d.v/100)*120}`).join(' ')} 300,140`} fill="url(#ag)"/>
              <polyline points={WEEK_DATA.map((d,i)=>`${(i/(WEEK_DATA.length-1))*300},${140-(d.v/100)*120}`).join(' ')} fill="none" stroke="#8fff00" strokeWidth="2" strokeLinejoin="round"/>
              {WEEK_DATA.map((d,i)=>(
                <circle key={i} cx={(i/(WEEK_DATA.length-1))*300} cy={140-(d.v/100)*120} r="3.5" fill="#8fff00" style={{filter:'drop-shadow(0 0 4px #8fff00)'}}/>
              ))}
            </svg>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
              {WEEK_DATA.map(d=>(
                <div key={d.d} style={{textAlign:'center'}}>
                  <div style={{fontSize:'0.6rem',color:'#3a4a64',...S.mono}}>{d.d}</div>
                  <div style={{fontSize:'0.6rem',color:fillColor(d.v),...S.mono}}>{d.v}%</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{borderTop:'1px solid #131e35',paddingTop:12,marginTop:8,display:'flex',gap:20}}>
            <div><div style={S.label}>7-day avg</div><div style={{...S.mono,fontSize:'1.1rem',color:'#8fff00',fontWeight:600}}>{avgV}%</div></div>
            <div><div style={S.label}>Peak</div><div style={{...S.mono,fontSize:'1.1rem',color:'#ffb347',fontWeight:600}}>{maxV}%</div></div>
          </div>
        </div>

        {/* Per-unit bars */}
        <div style={{...S.card,padding:'20px'}}>
          <div style={{fontSize:'0.85rem',fontWeight:600,color:'#f0f4ff',marginBottom:4}}>Per-Unit Fill</div>
          <div style={{...S.mono,fontSize:'0.62rem',color:'#5a6b8a',marginBottom:16}}>CURRENT % · ALL UNITS</div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {[...BINS].sort((a,b)=>b.fill-a.fill).map(b=>(
              <div key={b.id} style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{...S.mono,fontSize:'0.63rem',color:'#8fff00',minWidth:52}}>{b.id}</span>
                <div style={{flex:1}}><FillBar pct={b.fill} height={7} glow/></div>
                <span style={{...S.mono,fontSize:'0.65rem',color:fillColor(b.fill),minWidth:30,textAlign:'right',fontWeight:600}}>{b.fill}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      <div style={{...S.card,padding:'20px'}}>
        <div style={{fontSize:'0.85rem',fontWeight:600,color:'#f0f4ff',marginBottom:16}}>Fleet Status Breakdown</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:10}}>
          {Object.entries(statusMap).map(([k,{color,label}])=>{
            const count=BINS.filter(b=>b.status===k).length
            const pct=Math.round((count/BINS.length)*100)
            return(
              <div key={k} style={{background:'#0f1729',border:`1px solid ${color}20`,borderRadius:8,padding:'14px 16px',textAlign:'center'}}>
                <div style={{...S.mono,fontSize:'1.8rem',fontWeight:700,color,lineHeight:1,marginBottom:4}}>{count}</div>
                <div style={{fontSize:'0.68rem',color,...S.mono,marginBottom:6}}>{label.toUpperCase()}</div>
                <div style={{background:'#1a2840',borderRadius:9999,height:3,overflow:'hidden'}}>
                  <div style={{width:`${pct}%`,height:'100%',background:color,borderRadius:9999}}/>
                </div>
                <div style={{fontSize:'0.6rem',color:'#3a4a64',...S.mono,marginTop:4}}>{pct}% of fleet</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
