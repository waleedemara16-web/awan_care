// Runs the original Awan engine (js/00 … js/16) inside the Vue app.
// The files are loaded as text and injected as classic <script> tags, one per file and in order,
// exactly like the original index.html — later files patch functions defined by earlier ones,
// and they share top-level `let`/`const` bindings, so they can't be ES modules.
const files = import.meta.glob('./js/*.js', { query: '?raw', import: 'default' })

export function loadEngine() {
  if (window.__awanEngineLoadPromise) return window.__awanEngineLoadPromise
  if (typeof window.render === 'function' && typeof window.__awanState === 'function') {
    return Promise.resolve()
  }
  const loading = (async () => {
    const keys = Object.keys(files).sort((a, b) => {
      // the QR vendor library has to exist before the app files
      const va = a.includes('vendor') ? 0 : 1
      const vb = b.includes('vendor') ? 0 : 1
      return va - vb || a.localeCompare(b)
    })
    const sources = await Promise.all(keys.map((k) => files[k]()))
    sources.forEach((src, i) => {
      const el = document.createElement('script')
      el.dataset.awan = keys[i].replace('./js/', '')
      el.textContent = src
      document.body.appendChild(el)
    })
    if (typeof window.render !== 'function' || typeof window.__awanState !== 'function') {
      throw new Error('Awan engine failed to start')
    }
  })()
  window.__awanEngineLoadPromise = loading
  loading.catch(() => {
    if (window.__awanEngineLoadPromise === loading) delete window.__awanEngineLoadPromise
  })
  return loading
}

// ---- URL <-> engine state ----
// /                       → public landing
// /family                 → family portal
// /portal/:kind           → other public portals (doctor, school, kiosk, facility)
// /app                    → the role's home view
// /app/:view              → any workspace view (brain, journey, schedule …)
// /app/patients/:id       → a child's file
export function pathFromState(s) {
  if (s.view === 'public') {
    const p = s.portal || 'home'
    if (p === 'home') return '/'
    if (p === 'parent') return '/family'
    return '/portal/' + p
  }
  if (s.view === 'patient-detail' && s.patientId) return '/app/patients/' + s.patientId
  return '/app/' + (s.view || 'dashboard')
}

export function applyPath(s, path) {
  const parts = path.replace(/\/+$/, '').split('/').filter(Boolean)
  const before = JSON.stringify([s.view, s.portal, s.patientId])
  if (!parts.length) {
    s.view = 'public'
    s.portal = 'home'
  } else if (parts[0] === 'family') {
    s.view = 'public'
    if (s.portal !== 'parent') s.parentTab = null
    s.portal = 'parent'
  } else if (parts[0] === 'portal') {
    s.view = 'public'
    s.portal = parts[1] || 'home'
  } else if (parts[0] === 'app') {
    if (parts[1] === 'patients' && parts[2]) {
      s.view = 'patient-detail'
      s.patientId = parts[2]
    } else if (parts[1]) {
      s.view = parts[1]
    } else if (s.view === 'public' || !s.view) {
      s.view = 'dashboard'
    }
    delete s.portal
  }
  return JSON.stringify([s.view, s.portal, s.patientId]) !== before
}
