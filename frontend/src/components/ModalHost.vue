<template>
  <div class="modal-backdrop" :class="{ open: modal.type }" role="dialog" aria-modal="true" @keydown.esc="closeModal">
    <div v-if="modal.type" class="modal">
      <div class="modal-head">
        <h2>{{ title }}</h2>
        <button class="close" @click="closeModal">×</button>
      </div>

      <form v-if="modal.type === 'patient'" @submit.prevent="addPatient">
        <div class="form-grid">
          <div class="field"><label>اسم المستفيد</label><input class="input" name="name" required /></div>
          <div class="field"><label>العمر</label><input class="input" name="age" required placeholder="7 سنوات" /></div>
          <div class="field"><label>الاحتياج الأساسي</label><input class="input" name="need" required /></div>
          <div class="field"><label>المدرسة</label><input class="input" name="school" /></div>
          <div class="field"><label>ولي الأمر</label><input class="input" name="guardian" required /></div>
          <div class="field">
            <label>رقم تواصل ولي الأمر</label>
            <input class="input" name="phone" type="tel" required placeholder="05xxxxxxxx" />
          </div>
          <div class="field full"><label>البرنامج</label><input class="input" name="program" value="نطق ولغة" /></div>
        </div>
        <FormActions label="حفظ الملف" />
      </form>

      <form v-else-if="modal.type === 'appointment'" @submit.prevent="addAppointment">
        <div class="form-grid">
          <div class="field">
            <label>المستفيد</label>
            <select v-model="aptPatient" class="select" name="patient">
              <option v-for="p in state.patients" :key="p.id">{{ p.name }}</option>
            </select>
          </div>
          <div class="field">
            <label>رقم تواصل ولي الأمر</label>
            <input v-model="aptPhone" class="input" name="phone" type="tel" required />
          </div>
          <div class="field">
            <label>الخدمة</label>
            <select class="select" name="service">
              <option>جلسة نطق ولغة</option><option>علاج وظيفي</option><option>علاج طبيعي</option><option>تأهيل سلوكي</option>
            </select>
          </div>
          <div class="field"><label>التاريخ</label><input class="input" type="date" name="date" value="2026-09-08" required /></div>
          <div class="field"><label>الوقت</label><input class="input" type="time" name="time" value="09:00" required /></div>
          <div class="field">
            <label>المعالج</label>
            <select class="select" name="clinician">
              <option v-for="s in state.staff" :key="s.name">{{ s.name }}</option>
            </select>
          </div>
          <div class="field"><label>الغرفة</label><input class="input" name="room" value="غرفة 2" /></div>
        </div>
        <FormActions label="حفظ الموعد" />
      </form>

      <form v-else-if="modal.type === 'referral'" @submit.prevent="addReferral">
        <div class="form-grid">
          <div class="field"><label>عنوان الطلب</label><input class="input" name="name" required /></div>
          <div class="field"><label>الجهة / الشخص</label><input class="input" name="person" required /></div>
          <div class="field">
            <label>النوع</label>
            <select class="select" name="type"><option>عام</option><option>طبية</option><option>مدرسة</option></select>
          </div>
          <div class="field">
            <label>الأولوية</label>
            <select class="select" name="priority"><option>متوسطة</option><option>عالية</option><option>منخفضة</option></select>
          </div>
        </div>
        <FormActions label="إضافة للصندوق" />
      </form>

      <form v-else-if="modal.type === 'staff'" @submit.prevent="addStaff">
        <div class="form-grid">
          <div class="field"><label>الاسم</label><input class="input" name="name" required /></div>
          <div class="field"><label>الدور المهني</label><input class="input" name="role" required /></div>
          <div class="field"><label>ساعات الدوام</label><input class="input" name="schedule" value="08:00 — 16:00" /></div>
        </div>
        <FormActions label="حفظ الموظف" />
      </form>

      <form v-else-if="modal.type === 'department'" @submit.prevent="addDepartment">
        <div class="form-grid">
          <div class="field"><label>اسم القسم</label><input class="input" name="name" required /></div>
          <div class="field"><label>الأيقونة</label><input class="input" name="icon" value="✨" /></div>
          <div class="field full"><label>الوصف</label><textarea class="textarea" name="desc"></textarea></div>
          <div class="field full"><label>الخدمات</label><input class="input" name="services" /></div>
        </div>
        <FormActions label="حفظ القسم" />
      </form>

      <form v-else-if="modal.type === 'notes' && patient" @submit.prevent="saveNotes">
        <div class="field">
          <label>الملاحظات</label>
          <textarea class="textarea" name="notes" required :value="patient.notes"></textarea>
        </div>
        <FormActions label="حفظ الملاحظات" />
      </form>

      <template v-else-if="modal.type === 'registration' && registration">
        <div class="list">
          <div v-for="[label, value] in registrationRows" :key="label" class="float-row">
            <span>{{ label }}</span><b>{{ value }}</b>
          </div>
        </div>
        <div class="actions" style="margin-top: 16px">
          <button type="button" class="btn btn-outline" @click="closeModal">إغلاق</button>
        </div>
      </template>

      <template v-else-if="modal.type === 'reschedule' && booking">
        <p class="muted">{{ booking.specialist }} · السعر {{ booking.price }} ر.س (لن يتغيّر)</p>
        <form @submit.prevent="confirmReschedule">
          <div class="form-grid">
            <div class="field"><label>التاريخ الجديد</label><input class="input" type="date" name="day" :value="booking.day" required /></div>
            <div class="field"><label>الوقت الجديد</label><input class="input" type="time" name="time" :value="booking.time" required /></div>
          </div>
          <FormActions label="تأكيد التأجيل" />
        </form>
      </template>

      <template v-else-if="modal.type === 'package' && pkg">
        <p class="muted">{{ pkg.sessions }} جلسة · {{ pkg.price }} ر.س ({{ Math.round(pkg.price / pkg.sessions) }} ر.س للجلسة)</p>
        <form @submit.prevent="confirmPackagePurchase">
          <div class="field">
            <label>طريقة الدفع</label>
            <select class="select" name="payment"><option v-for="m in PAYMENT_METHODS" :key="m">{{ m }}</option></select>
          </div>
          <FormActions label="تأكيد الشراء والدفع" />
        </form>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, h, ref, watch } from 'vue'
import { state } from '@/store'
import { PAYMENT_METHODS, closeModal, formData, formatDate, modal, notify } from '@/utils'

const FormActions = (props) =>
  h('div', { class: 'actions' }, [
    h('button', { class: 'btn btn-primary' }, props.label),
    h('button', { type: 'button', class: 'btn btn-outline', onClick: closeModal }, 'إلغاء'),
  ])
FormActions.props = ['label']

const patient = computed(() => state.patients.find((x) => x.id === modal.id))
const registration = computed(() => (modal.type === 'registration' ? state.registrations[modal.id] : null))
const booking = computed(() => state.sessionBookings.find((x) => x.id === modal.id))
const pkg = computed(() => state.packages.find((x) => x.id === modal.id))

const title = computed(
  () =>
    ({
      patient: 'إضافة ملف مستفيد',
      appointment: 'حجز جلسة',
      referral: 'تسجيل إحالة',
      staff: 'إضافة موظف',
      department: 'إضافة قسم أو خدمة',
      notes: 'تعديل الملاحظات السريرية',
      registration: 'تفاصيل دراسة الحالة',
      reschedule: 'تأجيل الحجز',
      package: 'تأكيد شراء ' + (pkg.value?.name || ''),
    })[modal.type] || '',
)

// Appointment: guardian phone follows the selected beneficiary
const aptPatient = ref('')
const aptPhone = ref('')
watch(
  () => modal.type,
  (type) => {
    if (type === 'appointment') {
      aptPatient.value = state.patients[0]?.name || ''
      aptPhone.value = state.patients[0]?.phone || ''
    }
  },
)
watch(aptPatient, (name) => {
  const p = state.patients.find((x) => x.name === name)
  aptPhone.value = p ? p.phone || '' : ''
})

const registrationRows = computed(() => {
  const r = registration.value
  return [
    ['الطفل', r.child], ['تاريخ الميلاد / العمر', r.age], ['الجنس', r.gender], ['الجنسية', r.nationality],
    ['ولي الأمر', r.guardian], ['صلة القرابة', r.relation], ['رقم التواصل', r.phone], ['البريد الإلكتروني', r.email],
    ['نوع الولادة', r.birthType], ['مضاعفات الحمل / الولادة', r.birthNotes],
    ['عمر الجلوس بدون مساعدة', r.milestoneSitting], ['عمر المشي', r.milestoneWalking],
    ['عمر أول كلمة', r.milestoneFirstWord], ['عمر تكوين الجملة', r.milestoneSentence],
    ['فحص السمع', r.hearingChecked], ['فحص البصر', r.visionChecked], ['أمراض مزمنة / حساسية', r.chronic],
    ['أدوية حالية', r.medications], ['حالات مشابهة في العائلة', r.familyHistory],
    ['تقييم سابق في مركز آخر', r.priorEval], ['تفاصيل التقييم السابق', r.priorEvalDetails],
    ['مصدر التحويل', r.referralSource], ['وصف الحالة / الاحتياج', r.reason], ['الوقت المفضل للتواصل', r.contactTime],
    ['طريقة التواصل المفضلة', r.contactMethod], ['حالة الطلب', r.status], ['تاريخ الطلب', r.date ? formatDate(r.date) : ''],
  ].filter((x) => x[1])
})

function done(message) {
  closeModal()
  notify(message)
}

function addPatient(e) {
  const f = formData(e)
  const id = 'p' + Date.now()
  state.patients.unshift({
    id, name: f.name, file: 'AWN-' + String(1000 + state.patients.length + 1), age: f.age, need: f.need,
    program: f.program, school: f.school, guardian: f.guardian, phone: f.phone, status: 'نشط',
    notes: 'لم تتم إضافة ملاحظات بعد.', goal: 'سيتم تحديد الهدف بعد التقييم الأولي.',
    next: '2026-09-08T09:00', code: 'LOCAL-' + id.slice(-4),
  })
  done('تمت إضافة الملف بنجاح')
}

function addAppointment(e) {
  state.appointments.push({ ...formData(e), status: 'مجدول' })
  done('تم حجز الجلسة')
}

function addReferral(e) {
  state.referrals.unshift({ ...formData(e), status: 'جديدة', date: '2026-09-02' })
  done('أضيفت الإحالة إلى الصندوق')
}

function addStaff(e) {
  state.staff.push({ ...formData(e), status: 'متاح', present: false })
  done('تمت إضافة الموظف')
}

function addDepartment(e) {
  const f = formData(e)
  state.departments.push({
    id: 'local-' + Date.now(), icon: f.icon || '✨', name: f.name, desc: f.desc, state: 'جاهز',
    services: f.services || 'تخصيص الخدمات لاحقاً',
  })
  done('تمت إضافة القسم')
}

function saveNotes(e) {
  patient.value.notes = formData(e).notes
  done('تم حفظ الملاحظات السريرية')
}

function confirmReschedule(e) {
  const f = formData(e)
  Object.assign(booking.value, { day: f.day, time: f.time, status: 'مؤجّلة' })
  done('تم تعديل موعد الحجز')
}

function confirmPackagePurchase(e) {
  const f = formData(e)
  const p = pkg.value
  state.packagePurchases.unshift({
    id: 'PK-' + Date.now().toString().slice(-6), patientName: state.familySession.name, package: p.name,
    sessions: p.sessions, price: p.price, payment: f.payment, date: new Date().toISOString().slice(0, 10),
  })
  done(`تم الاشتراك في ${p.name} والدفع عبر ${f.payment} ✓`)
}
</script>
