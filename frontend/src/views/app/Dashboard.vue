<template>
  <PageHead :eyebrow="t('dashEyebrow')" :title="t('dashTitle')" :desc="t('dashWelcome')(state.center.name, state.center.city)">
    <button class="btn btn-primary" @click="openModal('appointment')">{{ t('bookSession') }}</button>
  </PageHead>

  <section class="hero">
    <div class="hero-inner">
      <div>
        <div style="color: #b9cdc0; font-size: 12px">● {{ t('heroDate') }}</div>
        <h2>{{ t('heroLine1') }}<br /><span>{{ t('heroLine2') }}</span></h2>
        <div style="color: rgba(255, 255, 255, 0.68); font-size: 12px">{{ t('heroSub') }}</div>
      </div>
      <div class="hero-stats">
        <div class="hero-stat"><b>{{ today }}</b><small>{{ t('heroStat1') }}</small></div>
        <div class="hero-stat"><b>{{ attendance }}%</b><small>{{ t('heroStat2') }}</small></div>
      </div>
    </div>
  </section>

  <section class="metric-grid">
    <Metric icon="patients" :label="t('metricActive')" :value="active" :detail="t('metricActiveDetail')(state.patients.length)" />
    <Metric icon="schedule" :label="t('metricSessions')" :value="scheduled" :detail="t('metricSessionsDetail')" />
    <Metric icon="check" :label="t('metricGoals')" value="7 / 9" :detail="t('metricGoalsDetail')" />
    <Metric icon="referrals" :label="t('metricReferrals')" :value="needsReview" :detail="t('metricReferralsDetail')" theme="gold" />
  </section>

  <div class="grid-2">
    <section class="card">
      <div class="card-head">
        <h2>{{ t('upcomingAppts') }}</h2>
        <RouterLink class="back-link" :to="{ name: 'schedule' }">{{ t('viewSchedule') }}</RouterLink>
      </div>
      <div class="list">
        <div v-for="(a, i) in upcoming" :key="i" class="list-row">
          <div class="list-main">
            <strong>{{ a.patient }}</strong>
            <small>{{ a.service }} · {{ a.clinician }} · {{ a.room }}</small>
          </div>
          <div class="list-end">
            <b style="font-size: 13px; color: var(--navy)">{{ formatTime(a.time) }}</b>
            <small style="display: block; color: var(--muted); font-size: 10px">{{ formatDate(a.date) }}</small>
          </div>
        </div>
      </div>
    </section>
    <section class="card">
      <div class="card-head">
        <h2>{{ t('quickActions') }}</h2>
        <span class="muted">{{ t('quickByRole') }}</span>
      </div>
      <div class="list">
        <button class="list-row" style="text-align: start; border: 1px solid var(--line); cursor: pointer" @click="openModal('patient')">
          <span style="color: var(--teal)"><Icon name="patients" /></span>
          <span class="list-main"><strong>{{ t('addFileTitle') }}</strong><small>{{ t('addFileDetail') }}</small></span>＋
        </button>
        <button class="list-row" style="text-align: start; border: 1px solid var(--line); cursor: pointer" @click="$router.push({ name: 'referrals' })">
          <span style="color: var(--gold)"><Icon name="referrals" /></span>
          <span class="list-main"><strong>{{ t('reviewReferralsTitle') }}</strong><small>{{ t('reviewReferralsDetail')(state.referrals.length) }}</small></span>→
        </button>
        <button class="list-row" style="text-align: start; border: 1px solid var(--line); cursor: pointer" @click="$router.push({ name: 'departments' })">
          <span style="color: var(--navy)"><Icon name="departments" /></span>
          <span class="list-main"><strong>{{ t('deptsTitle') }}</strong><small>{{ t('deptsDetail') }}</small></span>→
        </button>
      </div>
    </section>
  </div>

  <section class="card" style="max-width: 870px; margin: 18px auto 0">
    <div class="card-head">
      <h2>اختيار الدور</h2>
      <span class="muted">يمكن تغييره لاحقاً من إعدادات المركز</span>
    </div>
    <RoleGrid />
  </section>
</template>

<script setup>
import { computed } from 'vue'
import Icon from '@/components/Icon.vue'
import Metric from '@/components/Metric.vue'
import PageHead from '@/components/PageHead.vue'
import RoleGrid from '@/components/RoleGrid.vue'
import { state } from '@/store'
import { formatDate, formatTime, openModal, t } from '@/utils'

const active = computed(() => state.patients.filter((p) => p.status === 'نشط').length)
const today = computed(() => state.appointments.filter((a) => a.date === '2026-09-02' && a.status !== 'ملغي').length)
const scheduled = computed(() => state.appointments.filter((a) => a.status === 'مجدول').length)
const upcoming = computed(() =>
  state.appointments
    .filter((a) => a.status === 'مجدول')
    .slice()
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5),
)
const needsReview = computed(() => state.referrals.filter((r) => r.status === 'جديدة' || r.status === 'قيد الفرز').length)
const attendance = computed(() =>
  Math.round((state.staff.filter((s) => s.present).length / Math.max(state.staff.length, 1)) * 100),
)
</script>
