<template>
  <PageHead eyebrow="الإدارة / 06" title="إعدادات المركز" desc="الهوية، الأدوار، بيانات التواصل، وروابط البوابات — في مكان واحد.">
    <span class="pill pill-good">● يعمل محلياً</span>
  </PageHead>
  <div class="grid-2">
    <section class="card">
      <div class="card-head">
        <h2>ملف المركز</h2>
        <span class="muted">يحفظ بعد إعادة التحميل</span>
      </div>
      <form @submit.prevent="saveSettings">
        <div class="form-grid">
          <div class="field"><label>اسم المركز</label><input class="input" name="name" :value="state.center.name" required /></div>
          <div class="field"><label>المدينة</label><input class="input" name="city" :value="state.center.city" required /></div>
          <div class="field"><label>رقم التواصل</label><input class="input" name="phone" :value="state.center.phone" /></div>
          <div class="field"><label>البريد الإلكتروني</label><input class="input" name="email" :value="state.center.email" /></div>
          <div class="field full"><label>العنوان</label><input class="input" name="address" :value="state.center.address" /></div>
          <div class="field full"><label>اسم المشرف</label><input class="input" name="supervisor" :value="state.center.supervisor" /></div>
        </div>
        <div class="actions">
          <button class="btn btn-primary" type="submit">حفظ التغييرات</button>
          <button class="btn btn-outline" type="button" @click="print">طباعة البيانات</button>
        </div>
      </form>
    </section>
    <section class="card">
      <div class="card-head">
        <h2>الأدوار والصلاحيات</h2>
        <span class="muted">اختر مساحة العمل</span>
      </div>
      <RoleGrid compact />
      <div class="notice" style="margin-top: 16px">
        البيانات والصلاحيات هنا محفوظة على جهازك فقط للتجربة، وليست بديلاً عن صلاحيات Frappe على الخادم.
      </div>
    </section>
  </div>
  <section class="card" style="margin-top: 18px">
    <div class="card-head">
      <h2>روابط البوابات العامة</h2>
    </div>
    <div class="public-grid">
      <div v-for="portal in portals" :key="portal.to" class="portal-card" style="min-height: 145px">
        <span class="portal-icon"><Icon :name="portal.icon" :size="24" /></span>
        <h3>{{ portal.title }}</h3>
        <p>{{ portal.desc }}</p>
        <button class="btn btn-outline" @click="$router.push(portal.to)">{{ portal.button }}</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import Icon from '@/components/Icon.vue'
import PageHead from '@/components/PageHead.vue'
import RoleGrid from '@/components/RoleGrid.vue'
import { state } from '@/store'
import { formData, notify } from '@/utils'

const portals = [
  { to: '/family', icon: 'team', title: 'بوابة الأسرة', desc: 'عرض ملف الطفل والتقدم والمواعيد.', button: 'فتح البوابة' },
  { to: '/doctor', icon: 'medical', title: 'بوابة الطبيب', desc: 'إرسال إحالة طبية للمركز.', button: 'فتح البوابة' },
  { to: '/school', icon: 'school', title: 'بوابة المدرسة', desc: 'عرض الأهداف المصرح بها فقط.', button: 'فتح البوابة' },
  { to: '/kiosk', icon: 'idcard', title: 'كشك الحضور', desc: 'تسجيل حضور الفريق والزوار.', button: 'فتح الكشك' },
]

function saveSettings(e) {
  const f = formData(e)
  state.center = Object.fromEntries(['name', 'city', 'phone', 'email', 'address', 'supervisor'].map((k) => [k, f[k]]))
  notify('تم حفظ بيانات المركز — ستبقى بعد إعادة التحميل')
}

function print() {
  window.print()
}
</script>
