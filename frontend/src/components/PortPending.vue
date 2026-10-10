<template>
  <section class="card">
    <div class="empty">
      <Icon name="clipboardCheck" :size="34" />
      <h2 style="margin-top: 10px">{{ title }}</h2>
      <p>الشاشة دي لسه بتتنقل من <code>js/{{ source }}</code></p>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '@/components/Icon.vue'
import { HUBS } from '@/data/seed'

// Stand-in for a screen whose logic is still in the original awan_8 JS file
defineProps({ source: { type: String, required: true } })

const route = useRoute()
const title = computed(() => {
  for (const h of HUBS) for (const [k, l] of h.views) if (k === route.name) return l
  return route.name
})
</script>
