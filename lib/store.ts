// Simple client-side store using localStorage
// In Phase 2 this will be replaced by Supabase session

export type UserRole = 'volunteer' | 'nodal-officer' | 'admin' | null

export function getSession(): { role: UserRole; name: string } {
  if (typeof window === 'undefined') return { role: null, name: '' }
  try {
    const s = localStorage.getItem('psevai_session')
    return s ? JSON.parse(s) : { role: null, name: '' }
  } catch { return { role: null, name: '' } }
}

export function setSession(role: UserRole, name: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('psevai_session', JSON.stringify({ role, name }))
  window.dispatchEvent(new Event('psevai_auth_change'))
}

export function clearSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('psevai_session')
  window.dispatchEvent(new Event('psevai_auth_change'))
}

export function getLargeText(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('psevai_largetext') === '1'
}

export function setLargeText(val: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem('psevai_largetext', val ? '1' : '0')
  document.documentElement.classList.toggle('large-text', val)
}
