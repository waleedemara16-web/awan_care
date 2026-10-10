<template>
  <PortalShell title="كشك الحضور" :subtitle="state.center.name">
    <h2 style="margin-top: 18px">تسجيل حضور الفريق</h2>
    <p class="muted">اختر اسم الموظف لتسجيل حضوره اليوم.</p>
    <div class="list">
      <div v-for="(s, i) in state.staff" :key="i" class="list-row">
        <div class="list-main"><strong>{{ s.name }}</strong><small>{{ s.role }} · {{ s.schedule }}</small></div>
        <button class="btn" :class="s.present ? 'btn-outline' : 'btn-primary'" @click="markAttendance(s)">
          {{ s.present ? 'حاضر ✓' : 'تسجيل الحضور' }}
        </button>
      </div>
    </div>
    <ResultNotice :result="result" />
  </PortalShell>
</template>

<script setup>
import { ref } from 'vue'
import PortalShell from '@/components/PortalShell.vue'
import ResultNotice from '@/components/ResultNotice.vue'
import { state } from '@/store'

const result = ref(null)

function markAttendance(s) {
  s.present = true
  s.status = 'حاضر'
  result.value = { text: `تم تسجيل حضور ${s.name} بنجاح.` }
}
</script>
