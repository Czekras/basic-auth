// The shared catalog lets app visibility change without redeploying each tool.
const APPS_URL = 'https://czekras.github.io/support-tools/apps.json'

// All tools share this cache because GitHub Pages serves them from one origin.
const CACHE_KEY = 'support-tools:apps:schema-1'

// A bundled fallback keeps first-time offline visits usable; it may lag the
// catalog because cached or freshly fetched data takes precedence.
const FALLBACK = [
  {
    name: 'Basic Auth',
    short: 'Basic Auth',
    url: 'https://czekras.github.io/basic-auth/',
    icon: 'user-round-key',
    status: 'on',
  },
  {
    name: 'Contact',
    short: 'Contact',
    url: 'https://czekras.github.io/contact/',
    icon: 'clipboard-list',
    status: 'on',
  },
  {
    name: 'Kanban',
    short: 'Kanban',
    url: 'https://czekras.github.io/kanban/',
    icon: 'square-kanban',
    status: 'on',
  },
  {
    name: 'Navigation',
    short: 'Navigation',
    url: 'https://czekras.github.io/navigation/',
    icon: 'route',
    status: 'on',
  },
]

/** Returns cached apps synchronously for first paint, with an offline fallback. */
export function loadCachedApps() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (_) {
    /* Storage failures are non-fatal because the bundled fallback remains. */
  }
  return FALLBACK
}

/** Refreshes the catalog and cache; rejects so callers can retain stale data. */
export async function fetchApps() {
  const res = await fetch(APPS_URL)
  if (!res.ok) throw new Error(`apps fetch failed: ${res.status}`)
  const data = await res.json()
  // Accept both deployed catalog shapes during schema transitions.
  const apps = Array.isArray(data) ? data : data.apps
  if (!Array.isArray(apps)) throw new Error('apps.json malformed')
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(apps))
  } catch (_) {
    /* A successful refresh remains usable even when caching is unavailable. */
  }
  return apps
}

// Fail closed so misspelled or new statuses cannot expose an app accidentally.
const VISIBLE_STATUSES = new Set(['on', 'soon', 'maintenance'])

/** Returns displayable apps in stable alphabetical order. */
export function visibleApps(apps) {
  return apps
    .filter((a) => VISIBLE_STATUSES.has(a.status))
    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
}

/** Returns the catalog name matching the current URL, or null. */
export function currentAppName(apps) {
  const strip = (u) => u.replace(/\/+$/, '')
  const here = strip(window.location.href)
  const match = apps.find((a) => a.url && here.startsWith(strip(a.url)))
  return match ? match.name : null
}

export function navigateToApp(app) {
  window.location.href = app.url
}
