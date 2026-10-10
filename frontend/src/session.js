import { computed, reactive } from 'vue'
import { createResource } from 'frappe-ui'

// Frappe sets user_id / full_name cookies on login and resets them to Guest on logout
function readCookies() {
  return Object.fromEntries(
    document.cookie
      .split('; ')
      .filter(Boolean)
      .map((c) => {
        const i = c.indexOf('=')
        return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))]
      }),
  )
}

const cookies = readCookies()

export const session = reactive({
  user: cookies.user_id || 'Guest',
  fullName: cookies.full_name || '',
})

export const isLoggedIn = computed(() => Boolean(session.user) && session.user !== 'Guest')

// A new session gets a new CSRF token, which only a fresh page load picks up,
// so login and logout finish with a full navigation instead of a router push.
export const login = createResource({
  url: 'login',
  makeParams: ({ usr, pwd }) => ({ usr, pwd }),
  onSuccess() {
    const redirect = new URLSearchParams(window.location.search).get('redirect')
    window.location.href = '/awan' + (redirect && redirect.startsWith('/') ? redirect : '/app')
  },
})

export const logout = createResource({
  url: 'logout',
  onSuccess() {
    window.location.href = '/awan/'
  },
})
