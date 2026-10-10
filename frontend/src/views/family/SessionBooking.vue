<template>
  <template v-if="!state.familySession">
    <div class="notice-blue">سجّلي دخول من بطاقة «متابعة طفلي وحجوزاتي» أولًا لإتمام حجز الجلسة.</div>
    <button class="btn btn-outline" style="margin-top: 12px" @click="$router.push('/family/follow')">الذهاب لتسجيل الدخول</button>
  </template>
  <template v-else>
    <h3 style="font-size: 14px; margin-bottom: 10px">١) اختاري الأخصائي</h3>
    <div class="chips">
      <label v-for="s in state.staff" :key="s.name" class="chip" :class="{ checked: draft.specialist === s.name }" @click="draft.specialist = s.name">
        {{ s.name }}{{ s.premium ? ' ⭐ مميز' : '' }}
      </label>
    </div>

    <h3 style="font-size: 14px; margin: 18px 0 10px">٢) اختاري يوم الأسبوع المناسب</h3>
    <div class="chips">
      <label v-for="d in days" :key="d.iso" class="chip" :class="{ checked: draft.day === d.iso }" @click="pickDay(d.iso)">
        {{ d.label }} <small style="opacity: 0.65">{{ d.sub }}</small>
      </label>
    </div>

    <template v-if="draft.day">
      <h3 style="font-size: 14px; margin: 18px 0 10px">٣) اختاري الوقت</h3>
      <div class="chips">
        <label v-for="tm in times" :key="tm" class="chip" :class="{ checked: draft.time === tm }" @click="draft.time = tm">{{ tm }}</label>
      </div>
    </template>

    <h3 style="font-size: 14px; margin: 18px 0 10px">
      ٤) عرض الحجز الذهبي <small class="muted" style="font-weight: 400">(اختياري)</small>
    </h3>
    <div class="chips">
      <label class="chip" :class="{ checked: !draft.offer }" @click="draft.offer = ''">بدون عرض</label>
      <label v-for="o in state.goldenOffers" :key="o.id" class="chip" :class="{ checked: draft.offer === o.id }" @click="pickOffer(o.id)">
        🌟 {{ o.name }}
      </label>
    </div>
    <div v-if="calc.offer" class="notice" style="margin-top: 10px">{{ calc.offer.desc }}</div>

    <div class="notice-blue" style="margin-top: 18px">
      تحجزين أكتر من جلسة في الأسبوع؟ <b>الباقات العلاجية</b> توفرلك في السعر —
      <RouterLink class="back-link" to="/family/packages">شوفي الباقات</RouterLink>
    </div>

    <h3 style="font-size: 14px; margin: 18px 0 10px">٥) طريقة الدفع</h3>
    <div class="pay-grid">
      <div v-for="m in PAYMENT_METHODS" :key="m" class="pay-opt" :class="{ selected: draft.payment === m }" @click="draft.payment = m">{{ m }}</div>
    </div>

    <div class="amount-box" style="margin-top: 20px">
      <small>المبلغ المطلوب لهذه الجلسة</small>
      <b>{{ calc.price }} ر.س</b>
      <div v-if="calc.bonusNote" class="gateway-badges"><span>{{ calc.bonusNote }}</span></div>
    </div>
    <div class="actions">
      <button class="btn btn-primary" style="width: 100%" :disabled="!draft.day || !draft.time" @click="submit">تأكيد الحجز والدفع</button>
    </div>
  </template>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { state } from '@/store'
import { PAYMENT_METHODS, notify } from '@/utils'

const router = useRouter()
const times = ['09:00', '11:00', '13:00', '15:00', '17:00']

if (!state.bookingDraft) {
  state.bookingDraft = { day: null, time: null, specialist: state.staff[0]?.name || '', offer: '', payment: 'Apple Pay' }
}
const draft = computed(() => state.bookingDraft)

const days = computed(() => {
  const names = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const base = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base)
    d.setDate(base.getDate() + i + 1)
    return {
      iso: d.toISOString().slice(0, 10),
      label: names[d.getDay()],
      sub: new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'short' }).format(d),
    }
  })
})

const calc = computed(() => {
  const d = draft.value
  const sp = state.staff.find((s) => s.name === d.specialist)
  let price = state.sessionPrice + (sp && sp.premium ? 30 : 0)
  let bonusNote = ''
  const offer = state.goldenOffers.find((o) => o.id === d.offer)
  if (offer) {
    if (offer.type === 'discount') price = Math.round(price * (1 - offer.value / 100))
    if (offer.type === 'bonus') bonusNote = offer.desc
  }
  return { price, bonusNote, offer }
})

function pickDay(iso) {
  draft.value.day = iso
  draft.value.time = null
}

function pickOffer(id) {
  draft.value.offer = draft.value.offer === id ? '' : id
}

function submit() {
  const d = draft.value
  if (!d.day || !d.time) return notify('اختاري اليوم والوقت أولًا')
  const p = state.patients.find((x) => x.code === state.familySession.code)
  state.sessionBookings.unshift({
    id: 'BK-' + Date.now().toString().slice(-6), patientId: p ? p.id : null,
    patientName: p ? p.name : state.familySession.name, day: d.day, time: d.time, specialist: d.specialist,
    offer: calc.value.offer ? calc.value.offer.name : '', price: calc.value.price, payment: d.payment, status: 'مؤكد',
  })
  notify('تم تأكيد الحجز والدفع عبر ' + d.payment + ' ✓')
  state.bookingDraft = null
  router.push('/family/my-bookings')
}
</script>
