<template>
  <div class="public-shell">
    <div class="gate card" :style="maxWidth ? { maxWidth: maxWidth + 'px' } : null">
      <div class="public-head" style="margin: 0 0 20px">
        <div class="brand">
          <span class="brand-mark"><Logo :size="22" /></span>
          <span><strong>{{ title }}</strong><small>{{ subtitle }}</small></span>
        </div>
      </div>
      <slot name="back">
        <button class="back-link" @click="$router.push('/')">← العودة إلى دليل البوابات</button>
      </slot>
      <slot />
    </div>
  </div>
</template>

<script setup>
import Logo from './Logo.vue'

defineProps({ title: String, subtitle: String, maxWidth: Number })
</script>
