<template>
  <span class="pill" :class="variant || statusClass(status)">{{ status }}</span>
</template>

<script setup>
import { statusClass } from '@/utils'

defineProps({
  status: { type: String, default: '' },
  variant: { type: String, default: '' },
})
</script>
