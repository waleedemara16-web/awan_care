<template>
  <div class="section-grid-3" style="margin-top: 16px">
    <div v-for="p in state.packages" :key="p.id" class="section-card" style="position: relative">
      <span v-if="p.badge" class="pill pill-gold" style="position: absolute; top: 14px; left: 14px">{{ p.badge }}</span>
      <span class="section-icon"><Icon name="target" :size="22" /></span>
      <h3>{{ p.name }}</h3>
      <p>{{ p.desc }}</p>
      <div style="font-weight: 900; color: var(--navy); font-size: 20px; margin-bottom: 4px">{{ p.price }} ر.س</div>
      <div class="muted" style="font-size: 11px; margin-bottom: 12px">{{ p.sessions }} جلسة · {{ Math.round(p.price / p.sessions) }} ر.س للجلسة</div>
      <button class="btn btn-primary" style="width: 100%" @click="buy(p.id)">اختيار الباقة</button>
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/Icon.vue'
import { state } from '@/store'
import { notify, openModal } from '@/utils'

function buy(id) {
  if (!state.familySession) return notify('سجّلي دخول من «متابعة طفلي وحجوزاتي» أولًا لإتمام الاشتراك')
  openModal('package', id)
}
</script>
