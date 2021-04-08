import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/registration',
    name: 'Registration',
    component: () => import('@/views/RegistrationPage.vue')
  },
  {
    path: '/reset-password',
    name: 'Reset password',
    component: () => import('@/views/ResetPasswordPage.vue')
  },
  {
    path: '/me',
    name: 'Profile',
    meta: { requiresAuth: true },
    component: () => import('@/views/ProfilePage.vue')
  },
  {
    path: '/home',
    name: 'Home',
    meta: { requiresAuth: true },
    component: () => import('@/views/HomePage.vue')
  },
  {
    path: '/home/send-protocol',
    name: 'Send protocol',
    meta: { requiresAuth: true },
    component: () => import('@/views/SendProtocolPage.vue')
  },
  {
    path: '/home/send-protocol/parties',
    name: 'Parties',
    meta: { requiresAuth: true },
    component: () => import('@/views/PartiesPage.vue')
  },
  {
    path: '/home/protocols',
    name: 'User protocols',
    meta: { requiresAuth: true },
    component: () => import('@/views/ProtocolsPage.vue')
  },
  {
    path: '/home/protocols/protocol',
    name: 'Protocol details',
    meta: { requiresAuth: true },
    component: () => import('@/views/ProtocolDetailsPage.vue')
  },
  {
    path: '/home/send-violation',
    name: 'Send violation',
    meta: { requiresAuth: true },
    component: () => import('@/views/SendViolationPage.vue')
  },
  {
    path: '/home/violations',
    name: 'User violations',
    meta: { requiresAuth: true },
    component: () => import('@/views/ViolationsPage.vue')
  },
  {
    path: '/home/violations/violation',
    name: 'Violation details',
    meta: { requiresAuth: true },
    component: () => import('@/views/ViolationDetailsPage.vue')
  },
  {
    path: '/home/terms',
    name: 'Terms and conditions',
    component: () => import('@/views/TermsPage.vue')
  },
  {
    path: '/home/start-stream',
    name: 'Start stream',
    component: () => import('@/views/StartStreamPage.vue')
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router;
