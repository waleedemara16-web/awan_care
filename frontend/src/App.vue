<template>
  <a href="#app" class="skip-link">تخطي إلى المحتوى الرئيسي</a>
  <RouterView />
  <ModalHost />
  <div class="toast vue-toast" :class="{ show: toast.show }" role="status" aria-live="polite">{{ toast.message }}</div>
  <CommBanner />
</template>

<script setup>
import ModalHost from './components/ModalHost.vue'
import CommBanner from './components/CommBanner.vue'
import { toast } from './utils'
</script>
