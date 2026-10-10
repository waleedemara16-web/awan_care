<template>
  <div class="section-grid-2" style="margin-top: 16px">
    <div v-for="a in state.addonServices" :key="a.id" class="section-card">
      <span class="section-icon"><Icon name="heart" :size="22" /></span>
      <h3>{{ a.name }}</h3>
      <p>{{ a.desc }}</p>
      <div style="font-weight: 900; color: var(--navy); font-size: 18px; margin-bottom: 12px">
        {{ a.price }} ر.س <small class="muted" style="font-weight: 400; font-size: 11px">{{ a.unit }}</small>
      </div>
      <button class="btn btn-primary" style="width: 100%" @click="request(a)">اطلبي الخدمة</button>
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/Icon.vue'
import { state } from '@/store'
import { notify } from '@/utils'

function request(a) {
  if (!state.familySession) return notify('سجّلي دخول من «متابعة طفلي وحجوزاتي» أولًا')
  state.referrals.unshift({
    name: `طلب خدمة مكمّلة — ${a.name} لـ ${state.familySession.name}`, person: state.familySession.name,
    type: 'عام', priority: 'متوسطة', status: 'جديدة', date: new Date().toISOString().slice(0, 10),
  })
  notify(`تم إرسال طلب ${a.name} — سيتواصل الفريق لتأكيد الموعد والدفع (${a.price} ر.س)`)
}
</script>
