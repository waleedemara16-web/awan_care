<template>
  <div style="margin-top: 16px">
    <div class="note" style="margin-bottom: 16px">
      تغطية علاج التخاطب والتوحد إلزام تنظيمي من مجلس الضمان الصحي على شركات التأمين، لكنها تختلف حسب البوليصة — الرجاء تأكيد التغطية الفعلية مع شركتكم.
    </div>
    <div class="list">
      <div v-for="c in state.insuranceCompanies" :key="c.name" class="list-row" style="align-items: flex-start; flex-direction: column; gap: 8px">
        <strong>{{ c.name }}</strong>
        <div style="display: flex; gap: 6px; flex-wrap: wrap">
          <span v-for="x in c.covers" :key="'c' + x" class="pill pill-good">✓ {{ x }}</span>
          <span v-for="x in c.notCovers" :key="'n' + x" class="pill pill-red">✕ {{ x }}</span>
        </div>
        <small class="muted">نسبة تحمّل الأسرة التقريبية: {{ c.copay }}% · {{ c.note }}</small>
      </div>
    </div>
    <h3 style="font-size: 14px; margin: 20px 0 10px">طرق دفع الجزء غير المغطى</h3>
    <div class="pay-grid">
      <div v-for="m in PAYMENT_METHODS" :key="m" class="pay-opt">{{ m }}</div>
    </div>
  </div>
</template>

<script setup>
import { state } from '@/store'
import { PAYMENT_METHODS } from '@/utils'
</script>
