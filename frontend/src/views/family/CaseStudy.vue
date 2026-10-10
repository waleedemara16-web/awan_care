<template>
  <form @submit.prevent="submit">
    <div v-for="(section, i) in sections" :key="section.title" class="form-section">
      <div class="form-section-title"><span class="form-section-num">{{ i + 1 }}</span>{{ section.title }}</div>
      <div class="form-grid">
        <div v-for="f in section.fields" :key="f.name" class="field" :class="{ full: f.full }">
          <label>{{ f.label }} <small v-if="f.hint" class="hint">({{ f.hint }})</small></label>
          <select v-if="f.options" class="select" :name="f.name" :required="f.required">
            <option value="">اختر</option>
            <option v-for="o in f.options" :key="o">{{ o }}</option>
          </select>
          <textarea v-else-if="f.textarea" class="textarea" :name="f.name" :required="f.required" :placeholder="f.placeholder"></textarea>
          <input v-else class="input" :type="f.type || 'text'" :name="f.name" :required="f.required" :placeholder="f.placeholder" />
        </div>
      </div>
      <label v-if="i === sections.length - 1" class="consent-row" style="margin-top: 14px">
        <input type="checkbox" required />
        <span>
          أقر بأن البيانات المدخلة صحيحة، وأوافق على مشاركتها مع فريق {{ state.center.name }} لغرض دراسة الحالة والتواصل معي بخصوصها فقط، وفق سياسة خصوصية المركز.
        </span>
      </label>
    </div>
    <button class="btn btn-primary" style="width: 100%; margin-top: 18px">إرسال الدراسة</button>
  </form>
  <ResultNotice :result="result" />
</template>

<script setup>
import { ref } from 'vue'
import ResultNotice from '@/components/ResultNotice.vue'
import { state } from '@/store'
import { formData } from '@/utils'

const checks = ['تم — لا توجد ملاحظات', 'تم — توجد ملاحظات', 'لم يتم بعد']
const yesNo = ['نعم', 'لا']

const sections = [
  {
    title: 'بيانات الطفل',
    fields: [
      { name: 'child', label: 'اسم الطفل', required: true },
      { name: 'age', label: 'تاريخ الميلاد أو العمر', required: true, placeholder: 'مثال: 5 سنوات' },
      { name: 'gender', label: 'الجنس', required: true, options: ['ذكر', 'أنثى'] },
      { name: 'nationality', label: 'الجنسية', placeholder: 'مثال: سعودي' },
    ],
  },
  {
    title: 'بيانات ولي الأمر',
    fields: [
      { name: 'guardian', label: 'اسم ولي الأمر', required: true },
      { name: 'relation', label: 'صلة القرابة', required: true, options: ['الأب', 'الأم', 'ولي أمر آخر'] },
      { name: 'phone', label: 'رقم التواصل (جوال)', required: true, type: 'tel', placeholder: '05xxxxxxxx' },
      { name: 'email', label: 'البريد الإلكتروني', hint: 'اختياري', type: 'email' },
    ],
  },
  {
    title: 'الحمل والولادة',
    fields: [
      { name: 'birthType', label: 'نوع الولادة', options: ['طبيعية', 'قيصرية', 'لا أعلم'] },
      { name: 'birthNotes', label: 'مضاعفات أثناء الحمل أو الولادة', hint: 'إن وجدت', placeholder: 'اتركيه فارغاً إن لم توجد' },
    ],
  },
  {
    title: 'التاريخ التطوري',
    fields: [
      { name: 'milestoneSitting', label: 'عمر الجلوس بدون مساعدة', placeholder: 'بالأشهر' },
      { name: 'milestoneWalking', label: 'عمر المشي', placeholder: 'بالأشهر' },
      { name: 'milestoneFirstWord', label: 'عمر أول كلمة', placeholder: 'بالأشهر' },
      { name: 'milestoneSentence', label: 'عمر تكوين جملة من كلمتين', placeholder: 'بالأشهر' },
    ],
  },
  {
    title: 'الحالة الصحية',
    fields: [
      { name: 'hearingChecked', label: 'فحص السمع', options: checks },
      { name: 'visionChecked', label: 'فحص البصر', options: checks },
      { name: 'chronic', label: 'أمراض مزمنة أو حساسية', hint: 'إن وجدت' },
      { name: 'medications', label: 'أدوية حالية', hint: 'إن وجدت' },
    ],
  },
  {
    title: 'التاريخ الأسري ومصدر التحويل',
    fields: [
      { name: 'familyHistory', label: 'هل توجد حالات مشابهة في العائلة؟', options: yesNo },
      { name: 'priorEval', label: 'هل سبق عمل تقييم في مركز آخر؟', options: yesNo },
      { name: 'priorEvalDetails', label: 'تفاصيل التقييم السابق', hint: 'إن وجد', full: true, placeholder: 'اسم المركز والتقييم الذي تم، إن وجد' },
      {
        name: 'referralSource', label: 'كيف سمعتم عن المركز؟', full: true,
        options: ['توصية طبيب', 'توصية مدرسة أو روضة', 'صديق أو قريب', 'وسائل التواصل الاجتماعي', 'بحث في جوجل', 'أخرى'],
      },
    ],
  },
  {
    title: 'وصف الحالة الحالية',
    fields: [
      { name: 'reason', label: 'وصف الحالة / الاحتياج', required: true, full: true, textarea: true, placeholder: 'مثال: تأخر في النطق، صعوبة في التواصل...' },
    ],
  },
  {
    title: 'التواصل والموافقة',
    fields: [
      { name: 'contactTime', label: 'الوقت المفضل للتواصل', options: ['صباحاً (٩–١٢)', 'ظهراً (١٢–٣)', 'مساءً (٣–٦)'] },
      { name: 'contactMethod', label: 'طريقة التواصل المفضلة', options: ['اتصال هاتفي', 'واتساب'] },
    ],
  },
]

const result = ref(null)

function submit(e) {
  const f = formData(e)
  state.registrations.unshift({ ...f, status: 'قيد المراجعة', date: '2026-09-04' })
  e.target.reset()
  result.value = { text: `تم استلام دراسة حالة ${f.child} — سيتواصل معك فريق ${state.center.name} خلال يومي عمل.` }
}
</script>
