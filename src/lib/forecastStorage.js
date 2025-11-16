const STORAGE_KEY = 'totalpec_active_batch_id'
const SESSION_KEY = 'totalpec_session_initialized'

export function getStoredBatchId() {
  if (typeof window === 'undefined') return null
  const value = window.localStorage.getItem(STORAGE_KEY)
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function setStoredBatchId(batchId) {
  if (typeof window === 'undefined') return
  if (batchId) {
    window.localStorage.setItem(STORAGE_KEY, String(batchId))
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

export function clearBatchStorage() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

export function initializeSession() {
  if (typeof window === 'undefined') return
  
  // Verificar si ya se inicializó en esta sesión
  const sessionInitialized = window.sessionStorage.getItem(SESSION_KEY)
  
  if (!sessionInitialized) {
    // Primera carga de la sesión, limpiar localStorage
    clearBatchStorage()
    window.sessionStorage.setItem(SESSION_KEY, 'true')
  }
}
