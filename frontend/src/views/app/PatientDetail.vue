<template>
  <template v-if="p">
    <PageHead :eyebrow="`ملف ${p.file}`" :title="p.name" :desc="`${p.need} · ${p.program}`">
      <button class="btn btn-outline" @click="$router.push({ name: 'patients' })">← العودة للملفات</button>
    </PageHead>
    <div class="grid-2">
      <section class="card">
        <div class="card-head"><h2>بيانات المستفيد</h2><Pill :status="p.status" /></div>
        <div class="form-grid">
          <div><span class="muted">رقم الملف</span><b style="display: block">{{ p.file }}</b></div>
          <div><span class="muted">العمر</span><b style="display: block">{{ p.age }}</b></div>
          <div><span class="muted">المدرسة</span><b style="display: block">{{ p.school }}</b></div>
          <div><span class="muted">كود الأسرة</span><b style="display: block">{{ p.code }}</b></div>
        </div>
        <hr style="border: 0; border-top: 1px solid var(--line); margin: 20px 0" />
        <div class="card-head">
          <h2>الملاحظات السريرية</h2>
          <button class="btn btn-outline" @click="openModal('notes', p.id)">تعديل</button>
        </div>
        <p class="muted" style="line-height: 2">{{ p.notes }}</p>
      </section>
      <section class="card">
        <div class="card-head"><h2>الخطة العلاجية</h2><Pill status="قيد التقدم" /></div>
        <div class="notice-blue"><b>الهدف الحالي</b><br />{{ p.goal }}</div>
        <div style="margin-top: 20px">
          <div class="muted">الموعد القادم</div>
          <div style="font-size: 22px; font-weight: 800; color: var(--navy); margin-top: 4px">{{ formatDate(nextDate) }}</div>
          <div class="muted">{{ formatTime(nextTime) }} · {{ p.program.split('·')[0] }}</div>
        </div>
        <div style="margin-top: 20px">
          <div class="muted">التقدم العام</div>
          <div style="height: 9px; border-radius: 99px; background: #ece4d8; margin-top: 7px">
            <div style="height: 100%; width: 78%; background: var(--teal); border-radius: 99px"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); margin-top: 5px">
            <span>بداية الخطة</span><b>78%</b>
          </div>
        </div>
      </section>
    </div>
  </template>
  <div v-else class="empty">
    لم يتم العثور على الملف.
    <RouterLink class="back-link" :to="{ name: 'patients' }">العودة للملفات</RouterLink>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PageHead from '@/components/PageHead.vue'
import Pill from '@/components/Pill.vue'
import { state } from '@/store'
import { formatDate, formatTime, openModal } from '@/utils'

const props = defineProps({ id: String })

const p = computed(() => state.patients.find((x) => x.id === props.id))
const nextDate = computed(() => (p.value.next || '').split('T')[0])
const nextTime = computed(() => (p.value.next || '').split('T')[1])
</script>
