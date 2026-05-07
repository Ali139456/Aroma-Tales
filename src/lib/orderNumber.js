/** Local-only reference when Supabase checkout is disabled (order not persisted). */
export function generateOfflineOrderPlaceholder() {
  const t = Date.now().toString(36).toUpperCase()
  const r = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `AT-${t}-${r}`
}
