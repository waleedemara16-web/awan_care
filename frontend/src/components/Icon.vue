<template>
  <svg
    v-if="ICONS[name]"
    class="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    v-html="ICONS[name]"
  />
  <span v-else :style="{ fontSize: size + 'px', lineHeight: 1 }">{{ name }}</span>
</template>

<script setup>
import { ICONS } from '@/data/icons'

defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 18 },
  strokeWidth: { type: Number, default: 1.8 },
})
</script>
