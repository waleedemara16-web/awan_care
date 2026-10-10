<template>
  <div id="comm-banner" class="comm-banner" :class="{ show: banner.show }" role="status" aria-live="assertive">
    <template v-if="banner.show">
      <span class="comm-banner-ico"><Icon name="commHub" :size="16" /></span>
      <div class="comm-banner-text"><b>{{ banner.title }}</b>{{ banner.text }}</div>
      <button class="comm-banner-close" aria-label="إغلاق" @click="banner.show = false">×</button>
    </template>
  </div>
</template>

<script setup>
import Icon from '@/components/Icon.vue'
import { banner } from '@/utils'
</script>
