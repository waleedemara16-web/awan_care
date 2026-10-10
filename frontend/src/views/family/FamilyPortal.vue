<template>
  <PortalShell title="بوابة الأسرة" :subtitle="state.center.name" :max-width="tab.width?.()">
    <template v-if="tabKey !== 'menu'" #back>
      <button class="back-link" @click="$router.push('/family')">← رجوع لخيارات الأسرة</button>
    </template>
    <h2 v-if="tab.title" style="margin-top: 18px">{{ tab.title() }}</h2>
    <p v-if="tab.desc" class="muted">{{ tab.desc() }}</p>
    <component :is="tab.component" />
  </PortalShell>
</template>

<script setup>
import { computed } from 'vue'
import PortalShell from '@/components/PortalShell.vue'
import { state } from '@/store'
import Addons from './Addons.vue'
import CaseStudy from './CaseStudy.vue'
import Consultation from './Consultation.vue'
import FamilyMenu from './FamilyMenu.vue'
import Follow from './Follow.vue'
import Insurance from './Insurance.vue'
import MyBookings from './MyBookings.vue'
import Packages from './Packages.vue'
import Question from './Question.vue'
import SessionBooking from './SessionBooking.vue'

const props = defineProps({ tab: String })

const tabs = {
  menu: {
    component: FamilyMenu,
    width: () => 920,
    title: () => 'أهلاً بك في بوابة الأسرة',
    desc: () => 'اختاري الخدمة التي تحتاجينها الآن.',
  },
  follow: { component: Follow, width: () => (state.familySession ? 820 : undefined) },
  question: {
    component: Question,
    title: () => 'عندي سؤال',
    desc: () => `اكتبي سؤالك وهيوصل لفريق ${state.center.name} مباشرة.`,
  },
  'session-booking': {
    component: SessionBooking,
    width: () => 860,
    title: () => 'حجز جلسة علاجية',
    desc: () => 'اختاري ما يناسبكم وسيتأكد الحجز فورًا.',
  },
  packages: {
    component: Packages,
    width: () => 960,
    title: () => 'الباقات العلاجية',
    desc: () => 'اختاري الباقة الأنسب لاحتياج طفلك.',
  },
  insurance: {
    component: Insurance,
    width: () => 820,
    title: () => 'التأمين وطرق الدفع',
    desc: () => 'مرجع سريع لشركات التأمين وما تغطيه، وطرق الدفع المتاحة للجزء غير المغطى.',
  },
  addons: {
    component: Addons,
    width: () => 860,
    title: () => 'خدمات مكمّلة',
    desc: () => 'خدمات إضافية تدعم رحلة طفلك خارج جلسات المركز.',
  },
  'my-bookings': {
    component: MyBookings,
    width: () => 820,
    title: () => 'حجوزاتي',
    desc: () => 'كل حجوزاتك في مكان واحد — تقدرين تأجلي أو تلغي أي حجز.',
  },
  case: {
    component: CaseStudy,
    width: () => 760,
    title: () => 'دراسة حالة إلكترونية',
    desc: () =>
      `عبّئي البيانات التالية بدقة قدر الإمكان — كل ما تحتاجينه الآن هو المعلومات المتوفرة لديكِ، وسيتواصل معك فريق ${state.center.name} خلال يومي عمل لاستكمال ما تبقى.`,
  },
  booking: {
    component: Consultation,
    title: () => 'حجز كشف استشارة',
    desc: () => 'اختاري الموعد المناسب وسنؤكده خلال يوم عمل عبر رقم التواصل.',
  },
}

const tabKey = computed(() => (tabs[props.tab] ? props.tab : 'menu'))
const tab = computed(() => tabs[tabKey.value])
</script>
