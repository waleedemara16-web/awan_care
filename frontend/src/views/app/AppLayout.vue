<template>
  <header class="topbar">
    <button
      class="brand"
      style="border: 0; background: none; color: #fff; text-align: right; padding: 0"
      @click="router.push('/')"
    >
      <span class="brand-mark"><Logo :size="24" /></span>
      <span><strong>{{ t('brandFull') }}</strong><small>{{ t('brandSub') }}</small></span>
    </button>
    <div class="top-actions">
      <span class="role-chip">
        <span class="live-dot"></span><Icon :name="roles[state.role].icon" :size="14" /> {{ roles[state.role].label }}
      </span>
      <span class="role-chip">{{ session.fullName || session.user }}</span>
      <button :disabled="logout.loading" @click="logout.submit().catch(() => notify('تعذر تسجيل الخروج'))">تسجيل الخروج</button>
      <button @click="toggleTheme">{{ state.theme === 'dark' ? '☀' : '☾' }}</button>
      <button @click="toggleLang">{{ t('langToggle') }}</button>
      <button @click="router.push('/')">{{ t('publicPortals') }}</button>
    </div>
  </header>
  <div class="layout">
    <aside class="sidebar og-side hb-side">
      <div class="side-kicker">{{ t('workspaceLabel') }} · {{ roles[state.role].label }}</div>
      <nav class="side-nav hb-nav">
        <button
          v-for="h in hubs"
          :key="h.k"
          class="hb-i"
          :class="{ active: currentHub?.k === h.k, brain: h.k === 'brain' }"
          @click="goHub(h)"
        >
          <span class="nav-icon"><Icon :name="h.ic" :size="17" /></span>
          <span class="hb-t"><b>{{ h.l }}</b><small>{{ h.d }}</small></span>
        </button>
      </nav>
      <div class="side-footer">
        <b>{{ state.center.name }}</b><br />{{ state.center.city }}<br />
        <span style="color: #22c55e">● {{ t('dataLocal') }}</span><br />
        <button class="btn btn-outline" style="margin-top: 10px; width: 100%; font-size: 10px" @click="resetData">
          {{ t('resetSample') }}
        </button>
      </div>
    </aside>
    <main class="content">
      <!-- Tab strip for the views inside the current hub -->
      <nav v-if="currentHub && hubTabs.length > 1" class="hb-bar" :aria-label="currentHub.l">
        <span class="hb-bar-t"><Icon :name="currentHub.ic" :size="15" /> {{ currentHub.l }}</span>
        <div class="hb-bar-l">
          <button
            v-for="[k, l] in hubTabs"
            :key="k"
            :class="{ on: route.meta.nav === k }"
            @click="router.push({ name: k })"
          >
            {{ l }}
          </button>
        </div>
      </nav>
      <RouterView />
    </main>
  </div>
  <BackToTop />
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '@/components/Icon.vue'
import Logo from '@/components/Logo.vue'
import BackToTop from '@/components/BackToTop.vue'
import { HUBS, hubOf, hubViews, roles } from '@/data/seed'
import { resetState, state } from '@/store'
import { notify, t } from '@/utils'
import { logout, session } from '@/session'

const route = useRoute()
const router = useRouter()

const hubs = computed(() => HUBS.filter((h) => hubViews(h, state.role).length))
const currentHub = computed(() => hubOf(route.meta.nav))
const hubTabs = computed(() => (currentHub.value ? hubViews(currentHub.value, state.role) : []))

// Remember the last tab opened in each hub so clicking the hub returns to it
watch(
  () => route.meta.nav,
  (view) => {
    const h = hubOf(view)
    if (!h) return
    if (!state.hubLast || typeof state.hubLast !== 'object') state.hubLast = {}
    state.hubLast[h.k] = view
  },
  { immediate: true },
)

function goHub(h) {
  const vs = hubViews(h, state.role)
  if (!vs.length) return
  const last = (state.hubLast || {})[h.k]
  router.push({ name: vs.some(([k]) => k === last) ? last : vs[0][0] })
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark'
}

function toggleLang() {
  state.lang = state.lang === 'ar' ? 'en' : 'ar'
  notify(state.lang === 'ar' ? 'تم التبديل إلى العربية' : 'English mode is ready')
}

function resetData() {
  if (confirm('سيتم حذف تعديلات هذا الملف وإعادة البيانات التجريبية. هل تريد المتابعة؟')) {
    resetState()
    notify('تمت إعادة البيانات التجريبية')
  }
}
</script>
