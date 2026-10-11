// Keeps the engine's children (state.patients) in Frappe (DocType "Awan Patient").
// On start the server copy replaces the local one; after that every engine save
// sends only the records that changed or were removed.
import { call } from 'frappe-ui'

const snap = new Map() // id -> JSON of the last version the server has
let timer = null
let busy = false
let again = false

const engineState = () => window.__awanState()
const json = (p) => JSON.stringify(p)

function remember(list) {
  snap.clear()
  list.forEach((p) => snap.set(p.id, json(p)))
}

async function push() {
  if (busy) {
    again = true
    return
  }
  const list = engineState().patients || []
  const ids = new Set(list.map((p) => p.id))
  const changed = list.filter((p) => p && p.id && snap.get(p.id) !== json(p))
  const deleted = [...snap.keys()].filter((id) => !ids.has(id))
  if (!changed.length && !deleted.length) return
  busy = true
  try {
    await call('awan_care.api.save_patients', { changed, deleted })
    changed.forEach((p) => snap.set(p.id, json(p)))
    deleted.forEach((id) => snap.delete(id))
  } catch (e) {
    window.notify?.('تعذّر حفظ ملفات الأطفال على السيرفر — بتنحفظ أول ما يرجع الاتصال')
    setTimeout(schedule, 8000)
  } finally {
    busy = false
    if (again) {
      again = false
      schedule()
    }
  }
}

function schedule() {
  clearTimeout(timer)
  timer = setTimeout(push, 600)
}

let started = false
export async function startPatientSync() {
  if (started) return
  started = true
  const s = engineState()
  const server = await call('awan_care.api.get_patients')
  if (server.length) {
    // records saved before the Saudi-dialect pass get converted here and pushed back
    s.patients = window.awanDialect ? window.awanDialect(JSON.parse(JSON.stringify(server))) : server
    remember(server)
    window.persist()
    window.render()
  } else {
    // first run on this site: upload the children currently in the engine
    remember([])
    await push()
  }
  // Resetting to sample data would wipe the real children on the server
  window.resetData = () =>
    window.notify?.('إعادة البيانات التجريبية مقفولة — ملفات الأطفال محفوظة على السيرفر')
  const basePersist = window.persist
  window.persist = function (...args) {
    const r = basePersist.apply(this, args)
    schedule()
    return r
  }
}
