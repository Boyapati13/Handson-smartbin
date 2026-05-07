/**
 * HandsOn — Official brand logo components.
 * Inline SVG recreation of the HandsOn hand mark + wordmark.
 * Brand colour: #29ABE2
 *
 * Hand geometry (matches the official PNG):
 *  - 4 horizontal finger bars pointing LEFT, stacked vertically
 *  - Index (top) is longest, pinky (bottom) is shortest
 *  - All fingers connect seamlessly to a vertical palm bar on the RIGHT
 *  - Thumb extends from bottom-right of palm
 */

const BLUE = '#29ABE2'

export function HandsOnIcon({ size = 40, color = BLUE }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.12)}
      viewBox="0 0 80 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Palm — vertical rounded bar on the right, connecting all fingers */}
      <rect x="52" y="2"  width="24" height="68" rx="10" fill={color} />

      {/* Finger 1 — index (top, longest, reaches farthest left) */}
      <rect x="0"  y="2"  width="64" height="17" rx="8"  fill={color} />

      {/* Finger 2 — middle */}
      <rect x="8"  y="23" width="56" height="15" rx="7"  fill={color} />

      {/* Finger 3 — ring */}
      <rect x="16" y="42" width="48" height="14" rx="7"  fill={color} />

      {/* Finger 4 — pinky (shortest) */}
      <rect x="26" y="60" width="38" height="12" rx="6"  fill={color} />

      {/* Thumb — below and right of palm */}
      <rect x="52" y="68" width="28" height="20" rx="10" fill={color} />
    </svg>
  )
}

/** Full horizontal logo: hand icon + "handson" wordmark */
export function HandsOnLogo({ height = 36, color = BLUE }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(height * 0.28), lineHeight: 1 }}>
      <HandsOnIcon size={Math.round(height * 0.88)} color={color} />
      <span style={{
        fontFamily: "'Nunito', 'Figtree', 'Poppins', 'Arial Rounded MT Bold', sans-serif",
        fontWeight: 900,
        fontSize:   height,
        color,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        whiteSpace: 'nowrap',
      }}>
        handson
      </span>
    </div>
  )
}

/** Compact badge — sidebar navbar, headers */
export function HandsOnBadge({ iconSize = 30, color = BLUE, subColor = '#64748b' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(iconSize * 0.3) }}>
      <HandsOnIcon size={iconSize} color={color} />
      <div>
        <div style={{
          fontFamily: "'Nunito', 'Figtree', 'Poppins', 'Arial Rounded MT Bold', sans-serif",
          fontWeight: 900,
          fontSize:   Math.round(iconSize * 0.82),
          color,
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}>
          handson
        </div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize:   Math.round(iconSize * 0.28),
          color:      subColor,
          letterSpacing: '0.1em',
          lineHeight: 1.4,
          marginTop:  2,
        }}>
          SMARTBIN · OPS
        </div>
      </div>
    </div>
  )
}

export default HandsOnLogo
