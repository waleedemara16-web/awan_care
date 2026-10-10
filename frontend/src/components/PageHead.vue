<template>
  <div class="page-head">
    <div>
      <div class="eyebrow">{{ eyebrow }}</div>
      <h1>{{ title }}</h1>
      <div v-if="desc" class="muted">{{ desc }}</div>
    </div>
    <slot />
  </div>
</template>

<script setup>
defineProps({ eyebrow: String, title: String, desc: String })
</script>
