// Connects the engine's built-in server mode (js/02 + js/13: SV, svStart, svPush, svPull …) to Frappe.
// The engine talks to /api/state, /api/me, /api/events …; here those calls go to awan_care.platform
// methods and the live updates come from Frappe's socket.io, so the engine's own sync logic
// (three-way merge, conflict retry, family view, admin page) runs unchanged.
// installBridge() must run before the engine scripts: js/02 captures window.fetch when it loads.
import { initSocket } from 'frappe-ui'

const M = '/api/method/awan_care.platform.'
const native = window.fetch.bind(window)
let armed = false // until server mode starts, /api/health answers "no server" so the engine stays local

const csrf = () => (window.csrf_token && !window.csrf_token.includes('{{') ? window.csrf_token : '')

function serverMessage(j) {
  try {
    const list = JSON.parse(j._server_messages || '[]')
    if (list.length) return JSON.parse(list[0]).message
  } catch (e) {}
  return j.exception ? String(j.exception).split(':').pop().trim() : ''
}

async function frappeCall(fn, { method = 'GET', body, query } = {}) {
  const headers = { Accept: 'application/json' }
  if (method !== 'GET') {
    headers['Content-Type'] = 'application/json'
    if (csrf()) headers['X-Frappe-CSRF-Token'] = csrf()
  }
  const r = await native(M + fn + (query ? '?' + query : ''), {
    method,
    headers,
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  let j = {}
  try {
    j = await r.json()
  } catch (e) {}
  let payload = j.message !== undefined ? j.message : j
  if (!r.ok && !(payload && (payload.error || payload.set))) payload = { error: serverMessage(j) || 'HTTP ' + r.status }
  return { status: r.status, payload }
}

const reply = (status, payload) =>
  new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } })

async function forward(fn, opts) {
  const { status, payload } = await frappeCall(fn, opts)
  return reply(status, payload)
}

const readBody = (o) => {
  if (!o || o.body == null || typeof o.body !== 'string') return undefined
  try {
    return JSON.parse(o.body)
  } catch (e) {
    return undefined
  }
}

function header(o, name) {
  const h = (o && o.headers) || {}
  if (typeof h.get === 'function') return h.get(name)
  const k = Object.keys(h).find((x) => x.toLowerCase() === name.toLowerCase())
  return k ? h[k] : undefined
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result).split(',')[1] || '')
    fr.onerror = () => reject(fr.error)
    fr.readAsDataURL(blob)
  })
}

// OpenAI / Google answers come back as {status, content_type, body}: rebuild the original response
async function passThrough(fn, args) {
  const { status, payload } = await frappeCall(fn, { method: 'POST', body: args })
  if (!payload || payload.status === undefined) {
    return reply(status === 200 ? 502 : status, { error: { message: (payload && (payload.error?.message || payload.error)) || 'تعذّر' } })
  }
  return new Response(payload.body, { status: payload.status, headers: { 'Content-Type': payload.content_type || 'application/json' } })
}

async function aiProxy(path, o) {
  const args = { path, method: (o && o.method) || 'POST' }
  const body = o && o.body
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    const fields = []
    const files = []
    for (const [name, value] of body.entries()) {
      if (value instanceof Blob) {
        files.push({ name, filename: value.name || 'file', type: value.type, b64: await blobToBase64(value) })
      } else {
        fields.push({ name, value: String(value) })
      }
    }
    args.multipart = { fields, files }
  } else if (body != null) {
    args.body = typeof body === 'string' ? body : JSON.stringify(body)
    args.content_type = header(o, 'content-type') || 'application/json'
  }
  return passThrough('ai_proxy', args)
}

const unavailable = () => reply(501, { error: 'الميزة دي لسه مش متاحة على سيرفر Frappe' })

async function route(u, o) {
  const url = new URL(u, location.origin)
  const p = url.pathname
  const m = ((o && o.method) || 'GET').toUpperCase()
  const body = readBody(o)

  if (p === '/api/health') return armed ? forward('health') : new Response('', { status: 404 })
  if (p.startsWith('/api/ai/v1/')) return aiProxy(p.slice('/api/ai/v1/'.length), o)
  if (p === '/api/places/searchText') {
    return passThrough('places_search', { body: typeof o?.body === 'string' ? o.body : '{}', field_mask: header(o, 'x-goog-fieldmask') })
  }
  if (p === '/api/me') return forward('me')
  if (p === '/api/state' && m === 'GET') return forward('get_state', { query: url.searchParams.toString() })
  if (p === '/api/state' && m === 'PATCH') return patchState(body)
  if (p === '/api/state/init') return forward('init_state', { method: 'POST', body })
  if (p === '/api/lease') return forward('lease', { method: 'POST', body })
  if (p === '/api/family/login') return forward('family_login', { method: 'POST', body })
  if (p === '/api/login') return staffLogin(body)
  if (p === '/api/logout') {
    await frappeCall('family_logout', { method: 'POST', body: {} })
    return reply(200, { ok: true })
  }
  if (p === '/api/admin/users' && m === 'GET') return forward('admin_users')
  if (p === '/api/admin/users' && m === 'POST') return forward('admin_user_add', { method: 'POST', body })
  if (p.startsWith('/api/admin/users/')) {
    return forward('admin_user_set', { method: 'POST', body: { ...(body || {}), id: decodeURIComponent(p.slice('/api/admin/users/'.length)) } })
  }
  if (p === '/api/admin/secrets' && m === 'GET') return forward('admin_secrets')
  if (p === '/api/admin/secrets') return forward('admin_secrets_save', { method: 'POST', body })
  return unavailable() // push notifications, WhatsApp test, first-time setup
}

// Edits the server refused (center settings for non-management, deleting a child's file) come back
// as `revert`. They're put back after the engine has handled the reply (it marks what it sent as
// synced), so the device shows the server copy and doesn't send the refused edit again.
async function patchState(body) {
  const { status, payload } = await frappeCall('patch_state', { method: 'POST', body })
  const revert = status === 200 && payload && payload.revert
  if (revert) {
    setTimeout(() => {
      const SV = window.__awanSv
      const s = window.__awanState()
      Object.entries(revert).forEach(([k, v]) => {
        s[k] = v
        SV.snap[k] = JSON.stringify(v === undefined ? null : v)
      })
      window.persist()
      window.svRender()
    }, 0)
  }
  return reply(status, payload)
}

// The engine's own sign-in form (shown on the family screen's "فريق المركز" tab) signs in to Frappe.
// A new Frappe session needs a fresh page for its CSRF token, so success reloads the page.
async function staffLogin(body) {
  const r = await native('/api/method/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ usr: body?.username, pwd: body?.password }),
  })
  if (!r.ok) return reply(401, { error: r.status === 429 ? 'محاولات كتير — استنى شوية' : 'اسم المستخدم أو كلمة السر غلط' })
  location.reload()
  return new Promise(() => {})
}

// /api/events (Server-Sent Events in the engine) → Frappe socket.io events awan_state / awan_notify
class FrappeEvents {
  constructor() {
    this.readyState = 0
    this.onerror = null
    this.handlers = {}
    const s = (this.socket = initSocket())
    s.on('connect', () => {
      this.readyState = 1
      this.emit('hello', {})
    })
    s.on('disconnect', () => {
      if (this.readyState !== 2) this.readyState = 0
      this.onerror?.()
    })
    s.on('connect_error', () => this.onerror?.())
    s.on('awan_state', (d) => this.emit('state', d))
    s.on('awan_notify', (d) => this.emit('notify', d))
  }
  addEventListener(type, fn) {
    ;(this.handlers[type] = this.handlers[type] || []).push(fn)
  }
  emit(type, data) {
    ;(this.handlers[type] || []).forEach((fn) => fn({ data: JSON.stringify(data) }))
  }
  close() {
    this.readyState = 2
    this.socket.disconnect()
  }
}

let installed = false
export function installBridge() {
  if (installed) return
  installed = true
  window.fetch = function (u, o) {
    const url = typeof u === 'string' ? u : u instanceof URL ? u.href : null
    if (url) {
      const path = new URL(url, location.origin)
      if (path.origin === location.origin && path.pathname.startsWith('/api/') && !/^\/api\/(method|resource|v2)\//.test(path.pathname)) {
        return route(url, o)
      }
    }
    return native(u, o)
  }
  const NativeEventSource = window.EventSource
  window.EventSource = function (url, opts) {
    if (String(url) === '/api/events') return new FrappeEvents()
    return new NativeEventSource(url, opts)
  }
}

// After the engine loads: patch the few server-mode spots that assume the standalone Node server
function patchEngine() {
  const SV = window.__awanSv
  // Sign-out: family → clear the family cookie; staff → Frappe logout. Back to the Awan landing either way.
  window.svLogout = async function () {
    try {
      if (SV.user && SV.user.role === 'family') await frappeCall('family_logout', { method: 'POST', body: {} })
      else await native('/api/method/logout', { method: 'POST', credentials: 'same-origin', headers: csrf() ? { 'X-Frappe-CSRF-Token': csrf() } : {} })
    } catch (e) {}
    SV.user = null
    try {
      SV.es && SV.es.close()
    } catch (e) {}
    location.href = '/awan/'
  }
  // Full backup is a download link in the admin page
  const baseView = window.svView
  if (typeof baseView === 'function') {
    window.svView = function (...args) {
      return String(baseView.apply(this, args)).replace('href="/api/admin/backup"', `href="${M}backup"`)
    }
  }
  // No web-push / install banner on Frappe yet
  window.svPWA = () => {}
}

const isFamilyPath = (path) => /^\/family\b/.test(path || '')

// Turn server mode on: a signed-in Awan account (or a family session) works on the center's data on
// Frappe; a guest on the family portal gets the family sign-in; any other guest stays in local demo mode.
let starting = null
export function startServerMode(routePath) {
  const SV = window.__awanSv
  if (!SV) return Promise.resolve(false)
  if (SV.user) return Promise.resolve(true)
  if (starting) return starting
  starting = (async () => {
    armed = true
    patchEngine()
    const health = await frappeCall('health')
    if (health.status !== 200 || health.payload.name !== 'awan') return false
    SV.health = health.payload
    const me = await frappeCall('me')
    if (me.status === 200 && me.payload.user) {
      SV.on = true
      document.body.classList.add('sv-on')
      await window.svStart(me.payload.user)
      return true
    }
    if (isFamilyPath(routePath)) {
      SV.on = true
      document.body.classList.add('sv-on')
      window.svLoginScreen()
      return true
    }
    SV.on = false
    return false
  })().finally(() => {
    starting = null
  })
  return starting
}

// A guest who leaves the family portal goes back to the local demo mode (closes the family sign-in)
export function leaveGuestServerMode() {
  const SV = window.__awanSv
  if (!SV || SV.user || !SV.on) return
  SV.on = false
  document.body.classList.remove('sv-on')
  document.getElementById('sv-login')?.remove()
}
