<template>
  <form @submit.prevent="submit">
    <div class="form-grid">
      <div class="field"><label>اسم الطفل</label><input class="input" name="child" required /></div>
      <div class="field"><label>اسم ولي الأمر</label><input class="input" name="guardian" required /></div>
      <div class="field"><label>رقم التواصل</label><input class="input" name="phone" required /></div>
      <div class="field"><label>التاريخ المفضل</label><input class="input" type="date" name="date" required /></div>
      <div class="field"><label>الوقت المفضل</label><input class="input" type="time" name="time" required /></div>
    </div>
    <button class="btn btn-primary" style="width: 100%; margin-top: 18px">إرسال طلب الحجز</button>
  </form>
  <ResultNotice :result="result" />
</template>

<script setup>
import { ref } from 'vue'
import ResultNotice from '@/components/ResultNotice.vue'
import { state } from '@/store'
import { formData, formatDate, formatTime } from '@/utils'

const result = ref(null)

function submit(e) {
  const f = formData(e)
  state.referrals.unshift({
    name: `طلب حجز كشف استشارة — ${f.child} (${formatDate(f.date)} · ${formatTime(f.time)})`,
    person: `${f.guardian} · ${f.phone}`, type: 'استشارة', priority: 'عالية', status: 'جديدة', date: '2026-09-04',
  })
  e.target.reset()
  result.value = { text: `تم إرسال طلب الحجز — سنؤكد الموعد عبر التواصل معكِ على ${f.phone}.` }
}
</script>
