import { statusMap } from '../data/bins'

export default function StatusBadge({ status }) {
  const { color, label } = statusMap[status] || { color: '#3a4a64', label: 'Unknown' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.65rem', fontWeight: 500,
      color, background: `${color}14`, border: `1px solid ${color}30`,
      padding: '3px 9px', borderRadius: 4,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block',
        boxShadow: status === 'online' ? `0 0 6px ${color}` : 'none',
        animation: status === 'warning' ? 'breathe 1.8s ease-in-out infinite' : 'none'
      }} />
      {label}
    </span>
  )
}
