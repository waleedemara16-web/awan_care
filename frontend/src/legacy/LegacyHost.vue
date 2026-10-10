<template>
  <!-- The engine renders into #app, #modal, #toast and #comm-banner, same ids as the original index.html -->
  <div id="app" tabindex="-1"></div>
  <div id="modal" class="modal-backdrop" role="dialog" aria-modal="true"></div>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>
  <div v-if="status !== 'ready'" class="legacy-boot">
    <div v-if="status === 'loading'" class="muted">جاري تحميل أوان…</div>
    <div v-else class="notice" style="color: var(--danger)">تعذّر تشغيل المنصة: {{ error }}</div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { applyPath, loadEngine, pathFromState } from './engine'
import { startPatientSync } from './sync'
import { applyAccount, installLogin } from './login'
import { isLoggedIn } from '@/session'

const route = useRoute()
const router = useRouter()
const status = ref('loading')
const error = ref('')

const engineState = () => window.__awanState()

let wrapped = false
function wrapEngine() {
  if (wrapped) return
  wrapped = true
  // After every engine render, put the current screen in the URL so links, refresh and back/forward work
  const baseRender = window.render
  window.render = function (...args) {
    const r = baseRender.apply(this, args)
    syncUrl()
    return r
  }
  installLogin()
}

function syncUrl() {
  const s = engineState()
  if (s.sipadMode || s.intakeKiosk) return
  const path = pathFromState(s)
  if (path !== route.path) router.push(path)
}

function applyRoute() {
  const s = engineState()
  applyPath(s, route.path)
  window.persist()
  window.render()
}

onMounted(async () => {
  try {
    await loadEngine()
    wrapEngine()
    status.value = 'ready'
    applyRoute()
    if (isLoggedIn.value) {
      applyAccount().catch(() => {})
      startPatientSync().catch(() => window.notify?.('تعذّر تحميل ملفات الأطفال من السيرفر — شغالين على النسخة المحلية'))
    }
  } catch (e) {
    status.value = 'error'
    error.value = e.message || String(e)
  }
})

// Back/forward, typed URLs and router links drive the engine
watch(
  () => route.path,
  (path) => {
    if (status.value !== 'ready') return
    const s = engineState()
    if (pathFromState(s) === path) return
    if (applyPath(s, path)) {
      window.persist()
      window.render()
    }
  },
)
</script>

<style>
.legacy-boot {
  min-height: 60vh;
  display: grid;
  place-items: center;
}
</style>
