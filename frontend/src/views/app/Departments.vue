<template>
  <PageHead eyebrow="الأقسام / الخدمات" title="الأقسام والخدمات" desc="مساحة عمل موحدة للأقسام العلاجية والتعليمية، مع حالة جاهزية كل خدمة.">
    <button class="btn btn-primary" @click="openModal('department')">＋ إضافة قسم</button>
  </PageHead>
  <div class="notice-blue" style="margin-bottom: 18px">
    يمكن تخصيص الصلاحيات حسب الدور: الإشراف يرى كل الأقسام، الإدارة تتابع المؤشرات، الموظف يرى خدماته، والاستقبال يرى الخدمات المتاحة للحجز.
  </div>
  <section class="section-grid">
    <article v-for="d in state.departments" :key="d.id" class="section-card">
      <div class="section-icon"><Icon :name="d.icon" :size="22" /></div>
      <h3>{{ d.name }}</h3>
      <p>{{ d.desc }}</p>
      <div style="margin-bottom: 10px"><Pill :status="d.state" /></div>
      <small style="display: block; color: var(--muted); font-size: 10px">{{ d.services }}</small>
      <button class="btn btn-outline" style="width: 100%; margin-top: 14px" @click="notify(`تم فتح أدوات ${d.name}`)">فتح القسم</button>
    </article>
  </section>
</template>

<script setup>
import Icon from '@/components/Icon.vue'
import PageHead from '@/components/PageHead.vue'
import Pill from '@/components/Pill.vue'
import { state } from '@/store'
import { notify, openModal } from '@/utils'
</script>
