/**
 * Origin for Supabase auth redirect URLs. Trailing/leading whitespace in Site URL or
 * redirect_to becomes %20 in the host and causes DNS_PROBE_FINISHED_NXDOMAIN.
 */
export function appOrigin() {
  if (typeof window === 'undefined') return '';
  return String(window.location.origin).trim().replace(/\/$/, '');
}
