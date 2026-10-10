<template>
  <img :src="logo" :width="size" :height="size" alt="أوان" style="display: block; object-fit: contain" />
</template>

<script setup>
import logo from '@/assets/logo.png'

defineProps({ size: { type: Number, default: 24 } })
</script>
