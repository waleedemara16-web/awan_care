<template>
  <PortalShell title="ابدأ يومك في أوان" subtitle="اختر نوع المؤسسة" :max-width="!fac ? 960 : loggedIn ? 860 : undefined">
    <template v-if="fac" #back>
      <button class="back-link" @click="$router.push('/facility')">← اختيار نوع آخر</button>
    </template>

    <template v-if="!fac">
      <h2 style="margin-top: 18px">أي نوع مؤسسة تمثّلين؟</h2>
      <p class="muted">لكل نوع مؤسسة خدماتها وكود دخولها الخاص.</p>
      <div class="public-grid" style="margin-top: 20px">
        <div v-for="f in state.facilities" :key="f.type" class="portal-card">
          <span class="portal-icon"><Icon :name="f.icon" :size="24" /></span>
          <h3>{{ f.type }}</h3>
          <p>{{ f.tagline }}</p>
          <button class="btn btn-primary" @click="$router.push(`/facility/${FACILITY_SLUGS[f.type]}`)">دخول</button>
        </div>
      </div>
    </template>

    <template v-else-if="loggedIn">
      <h2 style="margin-top: 18px">أهلاً {{ fac.label }}</h2>
      <p class="muted">الخدمات المتاحة لكم عبر أوان:</p>
      <div class="list" style="margin-top: 14px">
        <div v-for="s in fac.services" :key="s" class="list-row">
          <div class="list-main"><strong>{{ s }}</strong></div>
        </div>
      </div>
      <div v-if="fac.type === 'مركز'" class="actions">
        <button class="btn btn-primary" @click="$router.push({ name: 'dashboard' })">الدخول الكامل لنظام المركز</button>
        <button class="btn btn-outline" @click="$router.push('/kiosk')">تسجيل حضور الفريق</button>
      </div>
      <div v-if="fac.type === 'مدرسة'" class="actions">
        <button class="btn btn-outline" @click="$router.push('/school')">فتح بوابة أهداف الطلاب</button>
      </div>
    </template>

    <template v-else>
      <h2 style="margin-top: 18px">دخول {{ fac.type }}</h2>
      <p class="muted">أدخلي كود مؤسستكم الذي شاركه معكم المركز.</p>
      <form @submit.prevent="facilityLogin">
        <div class="field"><label>كود المؤسسة</label><input v-model="code" class="input" required :placeholder="fac.code" /></div>
        <button class="btn btn-primary" style="width: 100%; margin-top: 18px">دخول</button>
      </form>
      <ResultNotice :result="result" />
    </template>
  </PortalShell>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import Icon from '@/components/Icon.vue'
import PortalShell from '@/components/PortalShell.vue'
import ResultNotice from '@/components/ResultNotice.vue'
import { state } from '@/store'
import { FACILITY_SLUGS } from '@/utils'

const props = defineProps({ slug: String })

const fac = computed(() => state.facilities.find((f) => FACILITY_SLUGS[f.type] === props.slug))
const loggedIn = computed(() => fac.value && state.facilitySession?.type === fac.value.type)

const code = ref('')
const result = ref(null)
watch(
  () => props.slug,
  () => {
    code.value = ''
    result.value = null
  },
)

function facilityLogin() {
  if (fac.value.code.toUpperCase() === code.value.trim().toUpperCase()) {
    state.facilitySession = { type: fac.value.type }
  } else {
    result.value = { error: true, text: 'الكود غير صحيح.' }
  }
}
</script>
