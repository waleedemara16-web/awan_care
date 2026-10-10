<template>
  <div style="margin-top: 18px">
    <div
      v-if="result"
      :class="result.error ? 'notice' : 'notice-blue'"
      :style="result.error ? 'background:var(--danger-2);border-color:#e9bcbc;color:var(--danger)' : ''"
    >
      <slot :result="result">{{ result.text }}</slot>
    </div>
  </div>
</template>

<script setup>
defineProps({ result: Object })
</script>
