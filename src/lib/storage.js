const KEY_PREFIX = 'project_basicauth:'

// Bump only for breaking data-shape changes, not ordinary releases. Add the
// previous key to LEGACY_KEYS so saved user data migrates forward.
const SCHEMA_VERSION = 1
const KEY = `${KEY_PREFIX}schema-${SCHEMA_VERSION}`

// Production once used a package-version key; consult it only when current data is absent.
const LEGACY_KEYS = [KEY_PREFIX + '0.1.0']

function removeStaleKeys() {
  try {
    for (let index = localStorage.length - 1; index >= 0; index--) {
      const key = localStorage.key(index)
      if (key && key !== KEY && key.startsWith(KEY_PREFIX))
        localStorage.removeItem(key)
    }
  } catch (_) {
    /* Blocked storage is non-fatal; stale keys are safe to leave in place. */
  }
}

export function loadStore() {
  try {
    const current = localStorage.getItem(KEY)
    if (current) return JSON.parse(current) || {}

    for (const legacyKey of LEGACY_KEYS) {
      const legacy = localStorage.getItem(legacyKey)
      if (legacy) {
        const data = JSON.parse(legacy) || {}
        saveStore(data)
        return data
      }
    }
    return {}
  } catch (_) {
    return {}
  } finally {
    removeStaleKeys()
  }
}

export function saveStore(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch (_) {
    /* Persistence is best-effort when storage is unavailable. */
  }
}
