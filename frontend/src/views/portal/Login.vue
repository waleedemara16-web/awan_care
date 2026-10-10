<template>
  <PortalShell title="دخول الفريق" :subtitle="state.center.name">
    <h2 style="margin-top: 18px">تسجيل الدخول إلى مساحة العمل</h2>
    <p class="muted">استخدم بريدك الإلكتروني وكلمة المرور الخاصة بحسابك في النظام.</p>
    <form @submit.prevent="submit">
      <div class="field">
        <label for="usr">البريد الإلكتروني أو اسم المستخدم</label>
        <input id="usr" v-model="usr" class="input" dir="ltr" autocomplete="username" required placeholder="name@center.sa" />
      </div>
      <div class="field" style="margin-top: 12px">
        <label for="pwd">كلمة المرور</label>
        <div style="position: relative">
          <input
            id="pwd"
            v-model="pwd"
            class="input"
            dir="ltr"
            style="padding-left: 64px"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            class="back-link"
            style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%)"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? 'إخفاء' : 'إظهار' }}
          </button>
        </div>
      </div>
      <button class="btn btn-primary" style="width: 100%; margin-top: 18px" :disabled="login.loading">
        {{ login.loading ? 'جاري الدخول…' : 'دخول' }}
      </button>
    </form>
    <ResultNotice :result="error" />
    <div style="margin-top: 14px; text-align: center">
      <a class="back-link" href="/login#forgot">نسيت كلمة المرور؟</a>
    </div>
  </PortalShell>
</template>

<script setup>
import { computed, ref } from 'vue'
import PortalShell from '@/components/PortalShell.vue'
import ResultNotice from '@/components/ResultNotice.vue'
import { login } from '@/session'
import { state } from '@/store'

const usr = ref('')
const pwd = ref('')
const showPassword = ref(false)

const error = computed(() => {
  const e = login.error
  if (!e) return null
  if (e.exc_type === 'AuthenticationError' || e.response?.status === 401) {
    return { error: true, text: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' }
  }
  if (e.response?.status === 429) {
    return { error: true, text: 'محاولات كثيرة غير ناجحة. انتظر قليلاً ثم حاول مرة أخرى.' }
  }
  return { error: true, text: e.messages?.join(' ') || 'تعذر تسجيل الدخول. حاول مرة أخرى.' }
})

function submit() {
  // Failures are shown from login.error
  login.submit({ usr: usr.value.trim(), pwd: pwd.value }).catch(() => {})
}
</script>
