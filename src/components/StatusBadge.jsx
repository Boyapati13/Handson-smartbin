import { statusColor } from '../data/bins'

export default function StatusBadge({ status }) {
  const { dot, label } = statusColor(status)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500,
      color: dot, background: `${dot}18`, border: `1px solid ${dot}44`,
      padding: '2px 8px', borderRadius: 9999,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block',
        boxShadow: status === 'online' ? `0 0 6px ${dot}` : 'none' }} />
      {label}
    </span>
  )
}
