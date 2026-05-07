/**
 * HandsOn — Official brand logo using the uploaded PNG.
 * File: public/handson_logo.png
 */

const LOGO = '/handson_logo.png'

function LogoImg({ h, maxW }) {
  return (
    <img
      src={LOGO}
      alt="HandsOn"
      style={{
        height:     h,
        width:      'auto',
        maxWidth:   maxW || 'none',
        display:    'block',
        objectFit:  'contain',
        flexShrink: 0,
      }}
      draggable={false}
    />
  )
}

/** Icon-only size — used in Topbar breadcrumb */
export function HandsOnIcon({ size = 40 }) {
  return <LogoImg h={size} />
}

/** Full logo — landing page header/footer */
export function HandsOnLogo({ height = 36 }) {
  return <LogoImg h={height} />
}

/** Compact badge — sidebar (constrained to sidebar width) */
export function HandsOnBadge({ iconSize = 30 }) {
  return <LogoImg h={Math.round(iconSize * 0.9)} maxW={180} />
}

export default HandsOnLogo
