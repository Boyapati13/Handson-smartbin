/** Shimmer skeleton used as loading placeholders. */

function Shimmer({ style = {} }) {
  return (
    <div style={{
      background: 'linear-gradient(90deg, var(--border) 25%, var(--raised) 50%, var(--border) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: 6,
      ...style,
    }} />
  );
}

export function KpiSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12, marginBottom: 24 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 22px', boxShadow: 'var(--shadow)' }}>
          <Shimmer style={{ height: 10, width: '40%', marginBottom: 12 }} />
          <Shimmer style={{ height: 32, width: '50%', marginBottom: 8 }} />
          <Shimmer style={{ height: 10, width: '70%' }} />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ height = 200 }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, boxShadow: 'var(--shadow)' }}>
      <Shimmer style={{ height: 14, width: '30%', marginBottom: 16 }} />
      <Shimmer style={{ height, borderRadius: 8 }} />
    </div>
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16 }}>
        {[20, 30, 15, 10, 15, 10].map((w, i) => (
          <Shimmer key={i} style={{ height: 10, width: `${w}%` }} />
        ))}
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid var(--ink)', display: 'flex', gap: 16, alignItems: 'center' }}>
          {[20, 30, 15, 10, 15, 10].map((w, j) => (
            <Shimmer key={j} style={{ height: 10, width: `${w}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// Inject shimmer keyframe once
if (typeof document !== 'undefined') {
  const id = 'skeleton-keyframes';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`;
    document.head.appendChild(style);
  }
}
