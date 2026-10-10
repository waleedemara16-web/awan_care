<template>
  <form @submit.prevent="submit">
    <div class="form-grid">
      <div class="field"><label>اسمك</label><input class="input" name="name" required /></div>
      <div class="field"><label>رقم التواصل</label><input class="input" type="tel" name="phone" required placeholder="05xxxxxxxx" /></div>
      <div class="field full"><label>سؤالك</label><textarea class="textarea" name="question" required placeholder="اكتبي سؤالك هنا..."></textarea></div>
    </div>
    <button class="btn btn-primary" style="width: 100%; margin-top: 18px">إرسال السؤال</button>
  </form>
  <ResultNotice :result="result" />
</template>

<script setup>
import { ref } from 'vue'
import ResultNotice from '@/components/ResultNotice.vue'
import { state } from '@/store'
import { formData } from '@/utils'

const result = ref(null)

function submit(e) {
  const f = formData(e)
  state.referrals.unshift({
    name: `سؤال من ${f.name}`, person: `${f.name} · ${f.phone}`, type: 'عام', priority: 'منخفضة',
    status: 'جديدة', date: '2026-09-04', note: f.question,
  })
  e.target.reset()
  result.value = { text: `تم استلام سؤالك — سيتواصل معك فريق ${state.center.name} على ${f.phone} قريباً.` }
}
</script>
