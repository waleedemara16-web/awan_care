<template>
  <div class="metric">
    <div class="metric-top">
      <span class="metric-icon" :class="{ gold: theme === 'gold' }"><Icon :name="icon" :size="18" /></span>
      <Pill :status="t('updatedToday')" />
    </div>
    <b>{{ value }}</b>
    <small>{{ label }} · {{ detail }}</small>
  </div>
</template>

<script setup>
import Icon from './Icon.vue'
import Pill from './Pill.vue'
import { t } from '@/utils'

defineProps({ icon: String, label: String, value: [String, Number], detail: String, theme: String })
</script>
