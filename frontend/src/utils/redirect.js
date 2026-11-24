// Where to go after logging in, from ?redirect=...
// Only paths inside Findr, so a link like ?redirect=https://evil.site can't send people away.
// Browsers read "/\evil.site" as "//evil.site", so backslashes are refused too.
export function safeRedirect(searchParams, fallback = '/dashboard') {
  const target = searchParams.get('redirect')
  if (target && target.startsWith('/') && !target.startsWith('//') && !target.includes('\\')) {
    return target
  }
  return fallback
}
