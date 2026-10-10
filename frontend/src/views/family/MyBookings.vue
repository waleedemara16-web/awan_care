<template>
  <div v-if="!state.familySession" class="notice-blue">سجّلي دخول من «متابعة طفلي وحجوزاتي» أولًا لعرض حجوزاتك.</div>
  <div v-else-if="!rows.length" class="empty">
    لا يوجد حجوزات بعد.
    <RouterLink class="back-link" to="/family/session-booking">احجزي جلسة الآن</RouterLink>
  </div>
  <div v-else class="list">
    <div v-for="b in rows" :key="b.id" class="list-row" style="align-items: flex-start">
      <div class="list-main">
        <strong>{{ formatDate(b.day) }} · {{ formatTime(b.time) }} — {{ b.specialist }}</strong>
        <small>{{ b.price }} ر.س · {{ b.payment }}<template v-if="b.offer"> · 🌟 {{ b.offer }}</template></small>
      </div>
      <div class="list-end">
        <Pill :status="b.status" :variant="b.status === 'ملغي' ? 'pill-red' : b.status === 'مؤجّلة' ? 'pill-gold' : 'pill-good'" />
        <div v-if="b.status !== 'ملغي'" style="margin-top: 8px; display: flex; gap: 6px; justify-content: flex-end">
          <button class="btn btn-outline" style="padding: 6px 10px; font-size: 11px" @click="openModal('reschedule', b.id)">تأجيل</button>
          <button class="btn btn-outline" style="padding: 6px 10px; font-size: 11px; color: var(--danger)" @click="cancel(b)">
            اعتذار / إلغاء
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Pill from '@/components/Pill.vue'
import { state } from '@/store'
import { formatDate, formatTime, notify, openModal } from '@/utils'

const rows = computed(() => state.sessionBookings.filter((b) => b.patientName === state.familySession?.name))

function cancel(b) {
  b.status = 'ملغي'
  notify('تم إلغاء الحجز، نتمنى نشوفك قريب')
}
</script>
