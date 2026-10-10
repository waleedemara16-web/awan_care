<template>
  <div class="role-grid" :style="compact ? 'grid-template-columns:1fr 1fr' : ''">
    <div
      v-for="(r, key) in roles"
      :key="key"
      class="role-card"
      :class="{ selected: state.role === key }"
      @click="changeRole(key)"
    >
      <span class="role-icon"><Icon :name="r.icon" :size="compact ? 20 : 22" /></span>
      <b>{{ r.label }}</b>
      <small>{{ r.desc }}</small>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import Icon from './Icon.vue'
import { canOpen, roleHome, roles } from '@/data/seed'
import { state } from '@/store'
import { notify } from '@/utils'

defineProps({ compact: Boolean })

const route = useRoute()
const router = useRouter()

function changeRole(role) {
  state.role = role
  if (route.meta.nav && !canOpen(role, route.meta.nav)) router.push({ name: roleHome(role) })
  notify(`تم التبديل إلى دور ${roles[role].label}`)
}
</script>
