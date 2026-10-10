import { reactive, watch } from 'vue'
import { seed } from './data/seed'

// Same storage key as the standalone HTML version
const KEY = 'awan-care-offline-v1'

const clone = (v) => JSON.parse(JSON.stringify(v))

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
    return saved
      ? { ...clone(seed), ...saved, center: { ...seed.center, ...(saved.center || {}) } }
      : clone(seed)
  } catch (e) {
    return clone(seed)
  }
}

export const state = reactive(load())

watch(
  state,
  (value) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(value))
    } catch (e) {}
  },
  { deep: true },
)

export function resetState() {
  try {
    localStorage.removeItem(KEY)
  } catch (e) {}
  for (const key of Object.keys(state)) delete state[key]
  Object.assign(state, clone(seed))
}
