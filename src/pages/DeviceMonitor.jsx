import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'
import { Wifi, WifiOff, Battery, Thermometer, Signal, RotateCcw, MapPin, ExternalLink } from 'lucide-react'
import { fillColor, statusMap } from '../data/bins'
import ArcGauge    from '../components/ArcGauge'
import FillBar     from '../components/FillBar'
import StatusBadge from '../components/StatusBadge'
import MapView     from '../components/MapView'

const mono = { fontFamily: 'IBM Plex Mono, monospace' }
const card = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow)' }

const DEVICE = {
  cardNo:   '26042400P101',
  imei:     '867105074732545',
  model:    'HY-CKX1',
  firmware: '4.37.0 HY_HSP_ItalyCustomer 20260424.1937',
  sn:       '1F43D2DB56',
  ethMac:   '8C:FC:A0:31:38:B5',
  wifiMac:  '40:D9:5A:6E:F6:66',
  binId:    'HS-001',
}

function MetricTile({ label, value, sub, color = 'var(--blue)', icon: Icon }) {
  return (
    <div style={{ ...card, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--ink)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color={color} />
        </div>
        <div style={{ ...mono, fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
      </div>
      <div style={{ ...mono, fontSize: '2rem', fontWeight: 700, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--sub)' }}>{sub}</div>}
    </div>
  )
}

export default function DeviceMonitor() {
  const { bins, connectedDevices } = useApp()

  const bin         = bins.find(b => b.id === DEVICE.binId)
  const isConnected = connectedDevices.some(d => d.cardNumber === DEVICE.cardNo && d.connected)
  const fc          = bin ? fillColor(bin.fill) : 'var(--sub)'

  return (
    <div style={{ padding: '28px 32px', animation: 'slideUp 0.3s ease both' }}>

      {/* Status banner */}
      <div style={{
        borderRadius: 14, padding: '18px 24px', marginBottom: 24,
        background: isConnected ? 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)' : 'var(--card)',
        border: `1.5px solid ${isConnected ? 'rgba(16,185,129,0.4)' : 'var(--border)'}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: isConnected ? 'rgba(16,185,129,0.12)' : 'var(--ink)', border: `1.5px solid ${isConnected ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isConnected ? <Wifi size={22} color="var(--green)" /> : <WifiOff size={22} color="var(--muted)" />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              {isConnected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981', animation: 'breathe 1.2s ease-in-out infinite' }} />}
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.2rem', fontWeight: 800, color: isConnected ? 'var(--green)' : 'var(--text)', letterSpacing: '-0.02em' }}>
                {isConnected ? 'DEVICE LIVE' : 'WAITING FOR DEVICE'}
              </span>
            </div>
            <div style={{ ...mono, fontSize: '0.7rem', color: 'var(--sub)' }}>
              {DEVICE.cardNo} · IMEI {DEVICE.imei} · {DEVICE.model}
            </div>
          </div>
        </div>

        <Link to={`/fleet/${DEVICE.binId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, background: 'var(--blue)', color: '#fff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Figtree, sans-serif', boxShadow: '0 4px 12px rgba(41,171,226,0.25)' }}>
          <ExternalLink size={13} /> View Bin Detail
        </Link>
      </div>

      {bin && (
        <>
          {/* Metric tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
            <MetricTile label="Fill Level"  value={`${Math.round(bin.fill)}%`}    sub="Current reading"                                                   color={fc}                                                      icon={RotateCcw}   />
            <MetricTile label="Battery"     value={`${Math.round(bin.battery)}%`} sub={bin.battery < 20 ? 'Low — check solar' : 'Solar charging'}         color={bin.battery < 20 ? 'var(--crimson)' : 'var(--green)'}    icon={Battery}     />
            <MetricTile label="Temperature" value={bin.temp > 0 ? `${bin.temp}°C` : '—'} sub="Internal sensor"                                           color="var(--sky)"                                              icon={Thermometer} />
            <MetricTile label="Signal"      value={`${bin.signal}/4`}             sub={bin.signal < 2 ? 'Weak signal' : 'Good signal'}                    color={bin.signal < 2 ? 'var(--amber)' : 'var(--blue)'}         icon={Signal}      />
            <MetricTile label="Compactions" value={bin.cycles}                    sub="Total cycles"                                                       color="var(--sub)"                                              icon={RotateCcw}   />
            <MetricTile label="Status"      value={statusMap[bin.status]?.label || bin.status} sub={isConnected ? 'Real device' : 'Offline'}              color={statusMap[bin.status]?.color || 'var(--sub)'}            icon={Wifi}        />
          </div>

          {/* Gauge + map */}
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ ...card, padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <div style={{ ...mono, fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.08em' }}>LIVE FILL LEVEL</div>
              <ArcGauge pct={Math.round(bin.fill)} size={140} stroke={11} />
              <div style={{ width: '100%' }}>
                <FillBar pct={Math.round(bin.fill)} height={8} glow showLabel />
              </div>
              <StatusBadge status={bin.status} />
            </div>

            <div style={{ ...card, overflow: 'hidden' }}>
              <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }}>{bin.name}</span>
                {bin.lat && bin.lng && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={12} color="var(--blue)" />
                    <span style={{ ...mono, fontSize: '0.62rem', color: 'var(--sub)' }}>{bin.lat?.toFixed(4)}, {bin.lng?.toFixed(4)}</span>
                  </div>
                )}
              </div>
              <MapView bins={[bin]} height={240} />
            </div>
          </div>

          {/* Device specs */}
          <div style={{ ...card, padding: '20px 24px', maxWidth: 480 }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', marginBottom: 14 }}>Device Info</div>
            {[
              ['Model',    DEVICE.model],
              ['Firmware', DEVICE.firmware.split(' ')[0]],
              ['Card No',  DEVICE.cardNo],
              ['IMEI',     DEVICE.imei],
              ['Serial',   DEVICE.sn],
              ['WiFi MAC', DEVICE.wifiMac],
              ['ETH MAC',  DEVICE.ethMac],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--ink)', gap: 12 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>{k}</span>
                <span style={{ ...mono, fontSize: '0.68rem', color: 'var(--text)', textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
