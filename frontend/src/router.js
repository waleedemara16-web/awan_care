import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from './session'

// The whole platform (landing, portals and workspace) runs on the Awan engine in src/legacy.
// Only the Frappe login screen is a separate Vue view.
const routes = [
  { path: '/login', name: 'login', component: () => import('./views/portal/Login.vue') },
  { path: '/:pathMatch(.*)*', name: 'awan', component: () => import('./legacy/LegacyHost.vue') },
]

const router = createRouter({
  history: createWebHistory('/awan'),
  routes,
  // the engine manages its own scrolling; only restore positions on back/forward
  scrollBehavior: (to, from, saved) => saved || false,
})

// The workspace is open without a Frappe login. Children's files are only kept on the
// server when someone is signed in (see legacy/sync.js); otherwise they stay in the browser.
router.beforeEach((to) => {
  if (to.name === 'login' && isLoggedIn.value) return '/app'
})

export default router
