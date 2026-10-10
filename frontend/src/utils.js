import { reactive } from 'vue'
import { state } from './store'
import { T } from './data/i18n'

export function t(key) {
  return T[state.lang][key]
}

export function statusClass(s) {
  return /مكتمل|نشط|متاحة|متاح|جاهز|تم التواصل|قيد التقدم/.test(s)
    ? 'pill-good'
    : /عالية|جديدة|قيد المراجعة|قريباً|في جلسة/.test(s)
      ? 'pill-gold'
      : /ملغي|متوقف|إجازة/.test(s)
        ? 'pill-red'
        : 'pill-grey'
}

export function formatDate(s) {
  if (!s) return '—'
  const d = new Date(s + 'T00:00:00')
  return isNaN(d)
    ? s
    : new Intl.DateTimeFormat(state.lang === 'ar' ? 'ar-SA' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d)
}

export function formatTime(s) {
  return (s || '').slice(0, 5)
}

export function formData(e) {
  return Object.fromEntries(new FormData(e.target).entries())
}

// Toast
export const toast = reactive({ message: '', show: false })
let toastTimer
export function notify(message) {
  toast.show = false
  toast.message = message
  clearTimeout(toastTimer)
  requestAnimationFrame(() => {
    toast.show = true
    toastTimer = setTimeout(() => (toast.show = false), 3000)
  })
}

// Comm banner (top-of-screen alert for new messages)
export const banner = reactive({ show: false, title: '', text: '' })
let bannerTimer
export function showBanner(title, text = '') {
  Object.assign(banner, { show: true, title, text })
  clearTimeout(bannerTimer)
  bannerTimer = setTimeout(() => (banner.show = false), 6000)
}

// Modal
export const modal = reactive({ type: null, id: null })
export function openModal(type, id = null) {
  modal.type = type
  modal.id = id
}
export function closeModal() {
  modal.type = null
  modal.id = null
}

export const PAYMENT_METHODS = ['Apple Pay', 'مدى', 'تابي', 'تمارا']

export const FACILITY_SLUGS = { مركز: 'center', عيادة: 'clinic', مستشفى: 'hospital', مدرسة: 'school' }
