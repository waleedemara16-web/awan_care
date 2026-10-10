<template>
  <PageHead eyebrow="سجل الحالات / 02" title="ملفات المستفيدين" desc="ملفات الرعاية النشطة، مرتبة لتصل إلى ما تحتاجه في ثوانٍ.">
    <button class="btn btn-primary" @click="openModal('patient')">＋ إضافة ملف</button>
  </PageHead>
  <section class="card">
    <div class="searchbar">
      <input v-model="query" class="input" placeholder="ابحث بالاسم أو رقم الملف أو الاحتياج" />
      <select v-model="status" class="select" style="max-width: 180px">
        <option value="">كل الحالات</option>
        <option>نشط</option>
        <option>متوقف مؤقتاً</option>
      </select>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>المستفيد</th><th>رقم الملف</th><th>العمر</th><th>الاحتياج</th><th>البرنامج</th><th>الحالة</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-if="!rows.length">
            <td colspan="7"><div class="empty">لا توجد ملفات مطابقة للبحث.</div></td>
          </tr>
          <tr v-for="p in rows" :key="p.id">
            <td><b>{{ p.name }}</b><small style="display: block; color: var(--muted)">{{ p.school }}</small></td>
            <td>{{ p.file }}</td>
            <td>{{ p.age }}</td>
            <td class="wrap">{{ p.need }}</td>
            <td class="wrap">{{ p.program }}</td>
            <td><Pill :status="p.status" /></td>
            <td>
              <button class="btn btn-outline" @click="$router.push({ name: 'patient', params: { id: p.id } })">فتح الملف</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import PageHead from '@/components/PageHead.vue'
import Pill from '@/components/Pill.vue'
import { state } from '@/store'
import { openModal } from '@/utils'

const query = ref('')
const status = ref('')

const rows = computed(() => {
  const q = query.value.toLowerCase()
  return state.patients.filter(
    (p) =>
      (!status.value || p.status === status.value) &&
      (!q || [p.name, p.file, p.need, p.school].join(' ').toLowerCase().includes(q)),
  )
})
</script>
