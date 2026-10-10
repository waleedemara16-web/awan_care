<template>
  <PortalShell title="بوابة الطبيب" subtitle="إحالة أولية">
    <h2 style="margin-top: 18px">إرسال إحالة طبية</h2>
    <p class="muted">ستصل الإحالة إلى صندوق المراجعة الداخلي، ولا ينشأ ملف تلقائياً.</p>
    <form @submit.prevent="publicReferral">
      <div class="form-grid">
        <div class="field"><label>اسم الطفل</label><input class="input" name="child" required /></div>
        <div class="field"><label>اسم الطبيب / الجهة</label><input class="input" name="person" required /></div>
        <div class="field full"><label>سبب الإحالة</label><textarea class="textarea" name="reason" required></textarea></div>
      </div>
      <button class="btn btn-primary" style="margin-top: 18px">إرسال الإحالة</button>
    </form>
    <ResultNotice :result="result" />
  </PortalShell>
</template>

<script setup>
import { ref } from 'vue'
import PortalShell from '@/components/PortalShell.vue'
import ResultNotice from '@/components/ResultNotice.vue'
import { state } from '@/store'
import { formData } from '@/utils'

const result = ref(null)

function publicReferral(e) {
  const f = formData(e)
  state.referrals.unshift({
    name: 'إحالة طبية — ' + f.child, person: f.person, type: 'طبية', priority: 'عالية', status: 'جديدة',
    date: '2026-09-02', note: f.reason,
  })
  e.target.reset()
  result.value = {
    text: `تم استلام الإحالة وإرسالها إلى صندوق مراجعة ${state.center.name}. رقم المتابعة: MR-${Date.now().toString().slice(-6)}.`,
  }
}
</script>
