<template>
  <PageHead eyebrow="الإحالات / 04" title="صندوق الإحالات" desc="حوّل طلبات التعاون الجديدة إلى مسارات رعاية واضحة، دون أن يفوتك أي طلب.">
    <button class="btn btn-primary" @click="openModal('referral')">＋ تسجيل إحالة</button>
  </PageHead>
  <section class="card">
    <div class="notice" style="margin-bottom: 17px">
      الإحالة العامة أو الطبية تدخل الصندوق الداخلي أولاً للمراجعة. لا يتم إنشاء ملف مستفيد تلقائياً قبل موافقة المركز.
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>الطلب</th><th>الجهة / الشخص</th><th>النوع</th><th>الأولوية</th><th>التاريخ</th><th>الحالة</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in state.referrals" :key="i">
            <td class="wrap">
              <b>{{ r.name }}</b>
              <template v-if="r.note"><br /><small class="muted">{{ r.note }}</small></template>
            </td>
            <td>{{ r.person }}</td>
            <td>{{ r.type }}</td>
            <td><Pill :status="r.priority" /></td>
            <td>{{ formatDate(r.date) }}</td>
            <td><Pill :status="r.status" /></td>
            <td><button class="btn btn-outline" @click="advanceReferral(r)">تحديث</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
  <section class="card" style="margin-top: 18px">
    <div class="card-head">
      <h2>طلبات تسجيل أولية</h2>
      <span class="muted">لا تنشئ ملفاً تلقائياً</span>
    </div>
    <div class="list">
      <div v-for="(r, i) in state.registrations" :key="i" class="list-row">
        <div class="list-main">
          <strong>{{ r.child }}</strong>
          <small>
            ولي الأمر: {{ r.guardian || '—' }} · {{ r.phone || '—' }} · {{ (r.reason || '').slice(0, 60) }}{{ (r.reason || '').length > 60 ? '…' : '' }}
          </small>
        </div>
        <div class="list-end">
          <Pill :status="r.status" />
          <button class="btn btn-outline" style="margin-right: 7px" @click="openModal('registration', i)">عرض التفاصيل</button>
          <button class="btn btn-outline" style="margin-right: 7px" @click="advanceRegistration(r)">تحديث</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import PageHead from '@/components/PageHead.vue'
import Pill from '@/components/Pill.vue'
import { state } from '@/store'
import { formatDate, notify, openModal } from '@/utils'

function advance(item, flow) {
  item.status = flow[(flow.indexOf(item.status) + 1) % flow.length]
}

function advanceReferral(r) {
  advance(r, ['جديدة', 'قيد الفرز', 'تم التواصل', 'مقبولة'])
  notify('تم تحديث حالة الإحالة')
}

function advanceRegistration(r) {
  advance(r, ['قيد المراجعة', 'تم التواصل', 'مقبول للمراجعة التالية'])
  notify('تم تحديث طلب التسجيل')
}
</script>
