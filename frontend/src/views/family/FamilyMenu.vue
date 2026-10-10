<template>
  <div class="public-grid" style="margin-top: 20px">
    <div v-for="item in items" :key="item.tab" class="portal-card">
      <span class="portal-icon"><Icon :name="item.icon" :size="24" /></span>
      <h3>{{ item.title }}</h3>
      <p>{{ item.desc }}</p>
      <button class="btn btn-primary" @click="$router.push(`/family/${item.tab}`)">{{ item.button }}</button>
    </div>
  </div>
</template>

<script setup>
import Icon from '@/components/Icon.vue'

const items = [
  { tab: 'follow', icon: 'eye', title: 'متابعة طفلي وحجوزاتي', desc: 'عرض ملف طفلك، التقدم في الأهداف، الموعد القادم، وكل حجوزاتك.', button: 'متابعة الملف' },
  { tab: 'session-booking', icon: 'schedule', title: 'حجز جلسة علاجية', desc: 'اختاري الأخصائي واليوم والوقت، مع عروض الحجز الذهبي.', button: 'احجزي الآن' },
  { tab: 'packages', icon: 'target', title: 'الباقات العلاجية', desc: 'باقات جلسات بسعر أوفر من الحجز الفردي.', button: 'عرض الباقات' },
  { tab: 'insurance', icon: 'idcard', title: 'التأمين وطرق الدفع', desc: 'شركات التأمين المتعاملة، ما تغطيه، وطرق الدفع الإلكتروني.', button: 'التفاصيل' },
  { tab: 'addons', icon: 'heart', title: 'خدمات مكمّلة', desc: 'متابعة منزلية أو شادو تيتشر داخل المدرسة، بأسعارها.', button: 'استكشفي الخدمات' },
  { tab: 'case', icon: 'book', title: 'دراسة حالة إلكترونية', desc: 'سجّلي بيانات طفلك الأولية ليقوم فريق المركز بدراسة حالته والتواصل معك.', button: 'بدء الدراسة' },
  { tab: 'booking', icon: 'schedule', title: 'حجز كشف استشارة', desc: 'احجزي موعد الكشف الأولي مع أحد مختصي المركز.', button: 'حجز موعد' },
  { tab: 'question', icon: 'question', title: 'عندي سؤال', desc: 'عندك استفسار سريع؟ ابعتيه وفريق المركز يرد عليك.', button: 'إرسال سؤال' },
]
</script>
