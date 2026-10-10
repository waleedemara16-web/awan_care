// Frappe sign-in inside the Awan screens: a modal in the engine's own style,
// opened from the landing "تسجيل الدخول" gate and from the workspace topbar.
import { call } from 'frappe-ui'
import { isLoggedIn, logout } from '@/session'

function loginModalHtml() {
  return `<div class="modal" style="width:min(440px,100%)"><div class="modal-head"><h2>تسجيل الدخول</h2><button class="close" onclick="closeModal()" aria-label="إغلاق">×</button></div>
    <p class="muted" style="margin-top:0">ادخل بحسابك في المركز عشان ملفات الأطفال تتحفظ على السيرفر وتظهر على كل الأجهزة.</p>
    <form onsubmit="awanLoginSubmit(event)" autocomplete="on">
      <div class="field"><label for="awan-usr">البريد الإلكتروني أو اسم المستخدم</label><input id="awan-usr" class="input" name="usr" dir="ltr" autocomplete="username" required placeholder="name@center.sa"></div>
      <div class="field" style="margin-top:12px"><label for="awan-pwd">كلمة المرور</label><input id="awan-pwd" class="input" name="pwd" type="password" dir="ltr" autocomplete="current-password" required></div>
      <div id="awan-login-err" class="notice" style="display:none;margin-top:12px;background:var(--danger-2);border-color:#fecaca;color:var(--danger)"></div>
      <button class="btn btn-primary" id="awan-login-btn" style="width:100%;margin-top:16px">دخول</button>
    </form>
    <div style="margin-top:12px;text-align:center"><a class="back-link" href="/login#forgot">نسيت كلمة المرور؟</a></div></div>`
}

function openLogin() {
  const m = document.getElementById('modal')
  if (!m) return
  m.innerHTML = loginModalHtml()
  m.classList.add('open')
  setTimeout(() => document.getElementById('awan-usr')?.focus(), 30)
}

async function submit(e) {
  e.preventDefault()
  const f = new FormData(e.target)
  const btn = document.getElementById('awan-login-btn')
  const err = document.getElementById('awan-login-err')
  btn.disabled = true
  btn.textContent = 'جاري الدخول…'
  err.style.display = 'none'
  try {
    const me = await call('awan_care.api.login', { usr: String(f.get('usr')).trim(), pwd: f.get('pwd') })
    if (me && me.pending) {
      // two-factor or forced password reset: finish it on Frappe's own login page
      window.location.href = '/login'
      return
    }
    // a new session needs a fresh page (new CSRF token); stay on the same screen
    window.location.reload()
  } catch (e) {
    const msg = String((e && (e.messages?.[0] || e.message)) || '')
    err.textContent = /Too Many|429|rate/i.test(msg)
      ? 'محاولات كتير — استنى دقيقة وجرّب تاني'
      : 'البريد أو كلمة المرور غلط — جرّب تاني'
    err.style.display = 'block'
    btn.disabled = false
    btn.textContent = 'دخول'
  }
}

export function installLogin() {
  window.awanLoginOpen = openLogin
  window.awanLoginSubmit = submit
  window.awanFrappeLogout = () => logout.submit()

  // Topbar: "تسجيل الدخول" when signed out, account name + sign-out when signed in
  const baseTopbar = window.topbar
  window.topbar = function (...args) {
    const html = baseTopbar.apply(this, args)
    const btn = isLoggedIn.value
      ? `<button onclick="awanFrappeLogout()" title="تسجيل الخروج من الحساب">⎋ خروج الحساب</button>`
      : `<button class="awan-login-btn" onclick="awanLoginOpen()">🔐 تسجيل الدخول</button>`
    return html.replace('<div class="top-actions">', '<div class="top-actions">' + btn)
  }

  // Landing gate: sign-in card first, then the original family / business choices
  const baseOpen = window.openModal
  window.openModal = function (type, ...rest) {
    if (type === 'awanLogin') return openLogin()
    const r = baseOpen.call(this, type, ...rest)
    if (type === 'entryGate' && !isLoggedIn.value) {
      const col = document.querySelector('#modal .modal div[style*="flex:1.3"]')
      const first = col && col.querySelector('.role-card')
      if (first) {
        first.insertAdjacentHTML(
          'beforebegin',
          `<div class="role-card" onclick="awanLoginOpen()" style="cursor:pointer;border-color:var(--teal)"><span class="role-icon">🔐</span><b>دخول فريق المركز</b><small>بحسابك في المركز — البيانات بتتحفظ على السيرفر</small></div>`,
        )
      }
    }
    return r
  }
}

// After a page load with a signed-in account: take the Awan role from the Frappe roles
export async function applyAccount() {
  if (!isLoggedIn.value) return null
  const me = await call('awan_care.api.me')
  const s = window.__awanState()
  window.__awanAccount = me
  if (me.awan_role && s.role !== me.awan_role) {
    s.role = me.awan_role
    window.persist()
    window.render()
  }
  return me
}
