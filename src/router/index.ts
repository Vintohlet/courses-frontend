import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', component: () => import('@/pages/HomePage.vue') },
    { path: '/recommendations', component: () => import('@/pages/RecommendationsPage.vue') },
    { path: '/courses/:id', component: () => import('@/pages/CoursePage.vue') },
    {
      path: '/courses/:id/learn',
      component: () => import('@/pages/LearnPage.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/login', component: () => import('@/pages/AuthPage.vue') },
    { path: '/register', component: () => import('@/pages/AuthPage.vue') },
    {
      path: '/me',
      component: () => import('@/pages/ProfilePage.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/:pathMatch(.*)*', component: () => import('@/pages/NotFoundPage.vue') },
  ],
})
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !useAuthStore().signedIn)
    return { path: '/login', query: { redirect: to.fullPath } }
})
export function safeRedirect(value: unknown) {
  return typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\') &&
    !['/login', '/register'].includes(value.split('?')[0] || '')
    ? value
    : '/'
}
export default router
