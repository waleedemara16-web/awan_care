<template>
  <PageHead eyebrow="الجدول / 03" title="إيقاع اليوم" desc="نظرة هادئة على الجلسات القادمة وتوزيع الغرف والفريق.">
    <button class="btn btn-primary" @click="openModal('appointment')">＋ حجز جلسة</button>
  </PageHead>
  <section class="card">
    <div class="card-head">
      <h2>جدول المواعيد</h2>
      <span class="muted">{{ state.appointments.length }} مواعيد محفوظة</span>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>التاريخ</th><th>الوقت</th><th>المستفيد</th><th>الخدمة</th><th>المعالج</th><th>الغرفة</th><th>الحالة</th></tr>
        </thead>
        <tbody>
          <tr v-for="(a, i) in state.appointments" :key="i">
            <td>{{ formatDate(a.date) }}</td>
            <td><b>{{ formatTime(a.time) }}</b></td>
            <td>{{ a.patient }}</td>
            <td>{{ a.service }}</td>
            <td>{{ a.clinician }}</td>
            <td>{{ a.room }}</td>
            <td><Pill :status="a.status" /></td>
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
import { formatDate, formatTime, openModal } from '@/utils'
</script>
