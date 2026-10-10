<template>
  <PortalShell title="بوابة المدرسة" subtitle="الأهداف المصرح بها فقط">
    <h2 style="margin-top: 18px">دخول المدرسة</h2>
    <p class="muted">استخدم اسم الطفل وكود المدرسة المشارك من المركز.</p>
    <form @submit.prevent="schoolLogin">
      <div class="field"><label>اسم الطفل</label><input v-model="name" class="input" required placeholder="مثال: عبدالله محمد الحربي" /></div>
      <div class="field" style="margin-top: 12px"><label>كود المدرسة</label><input v-model="code" class="input" required placeholder="SCHOOL-1001" /></div>
      <button class="btn btn-primary" style="width: 100%; margin-top: 18px">عرض الأهداف</button>
    </form>
    <ResultNotice :result="result">
      <template #default="{ result: r }">
        <template v-if="r.patient">
          <b>الأهداف المصرح بها لـ {{ r.patient.name }}</b><br /><br />
          • {{ r.patient.goal }}<br />• الانتقال بين الأنشطة مع دعم بصري<br />• المشاركة في نشاط جماعي لمدة 5 دقائق
        </template>
        <template v-else>{{ r.text }}</template>
      </template>
    </ResultNotice>
  </PortalShell>
</template>

<script setup>
import { ref } from 'vue'
import PortalShell from '@/components/PortalShell.vue'
import ResultNotice from '@/components/ResultNotice.vue'
import { state } from '@/store'

const name = ref('')
const code = ref('')
const result = ref(null)

function schoolLogin() {
  const n = name.value.trim()
  const c = code.value.trim().toUpperCase()
  const patient = state.patients.find((x) => x.name === n && x.schoolCode === c)
  result.value = patient ? { patient } : { error: true, text: 'تحقق من اسم الطفل وكود المدرسة المستقل.' }
}
</script>
