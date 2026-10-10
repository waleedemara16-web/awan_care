<template>
  <PageHead eyebrow="الفريق / 05" title="فريق الرعاية" desc="وازن الأحمال، واحمِ وقت الفريق، وامنح كل حالة التخصص الذي تحتاجه.">
    <button class="btn btn-primary" @click="openModal('staff')">＋ إضافة موظف</button>
  </PageHead>
  <section class="card">
    <div class="card-head">
      <h2>الفريق وساعات الدوام</h2>
      <span class="muted">{{ state.staff.filter((s) => s.present).length }} حاضر الآن</span>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>الموظف</th><th>الدور</th><th>ساعات الدوام</th><th>الحضور</th><th>الحالة</th></tr>
        </thead>
        <tbody>
          <tr v-for="(s, i) in state.staff" :key="i">
            <td><b>{{ s.name }}</b></td>
            <td>{{ s.role }}</td>
            <td>{{ s.schedule }}</td>
            <td><Pill :status="s.present ? 'حاضر' : 'غير حاضر'" /></td>
            <td><Pill :status="s.status" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import PageHead from '@/components/PageHead.vue'
import Pill from '@/components/Pill.vue'
import { state } from '@/store'
import { openModal } from '@/utils'
</script>
