/*
  The Findr logo: a magnifying glass on a purple square.
  Drawn in SVG so it stays sharp at any size.
*/
function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--color-primary)" />
      <circle cx="14" cy="14" r="6.5" fill="none" stroke="#ffffff" strokeWidth="3" />
      <path d="M19 19l6 6" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export default Logo
