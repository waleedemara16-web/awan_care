<template>
  <template v-if="state.familySession">
    <h2 style="margin-top: 18px">أهلاً، {{ state.familySession.name }}</h2>
    <div v-if="patient" class="list" style="margin-top: 14px">
      <div class="list-row"><div class="list-main"><strong>الملف</strong><small>{{ patient.file }}</small></div></div>
      <div class="list-row"><div class="list-main"><strong>البرنامج العلاجي</strong><small>{{ patient.program }}</small></div></div>
      <div class="list-row">
        <div class="list-main">
          <strong>الموعد القادم</strong>
          <small>{{ formatDate(patient.next.split('T')[0]) }} · {{ formatTime(patient.next.split('T')[1]) }}</small>
        </div>
      </div>
      <div class="list-row"><div class="list-main"><strong>هدف الأسبوع</strong><small>{{ patient.goal }}</small></div></div>
    </div>
    <h3 style="font-size: 14px; margin: 20px 0 10px">حجوزاتي</h3>
    <MyBookings />
    <div class="actions">
      <button class="btn btn-primary" @click="$router.push('/family/session-booking')">حجز جلسة جديدة</button>
      <button class="btn btn-outline" @click="logout">تسجيل الخروج</button>
    </div>
  </template>
  <template v-else>
    <h2 style="margin-top: 18px">متابعة طفلي</h2>
    <p class="muted">أدخلي اسم الطفل وكود الوصول الذي شاركه المركز.</p>
    <form @submit.prevent="login">
      <div class="field"><label>اسم الطفل</label><input v-model="name" class="input" required placeholder="مثال: عبدالله محمد الحربي" /></div>
      <div class="field" style="margin-top: 12px"><label>كود الوصول</label><input v-model="code" class="input" required placeholder="مثال: ALI-1001" /></div>
      <button class="btn btn-primary" style="width: 100%; margin-top: 18px">التحقق من الملف</button>
    </form>
    <ResultNotice :result="result" />
  </template>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ResultNotice from '@/components/ResultNotice.vue'
import { state } from '@/store'
import { formatDate, formatTime } from '@/utils'
import MyBookings from './MyBookings.vue'

const router = useRouter()
const name = ref('')
const code = ref('')
const result = ref(null)

const patient = computed(() => state.patients.find((x) => x.code === state.familySession?.code))

function login() {
  const n = name.value.trim()
  const c = code.value.trim().toUpperCase()
  const p = state.patients.find((x) => x.name === n && x.code.toUpperCase() === c)
  if (p) {
    state.familySession = { name: p.name, code: p.code }
    result.value = null
  } else {
    result.value = { error: true, text: 'لم يتم العثور على الملف. تحقق من الاسم وكود الوصول.' }
  }
}

function logout() {
  state.familySession = null
  router.push('/family')
}
</script>
