import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import LoginPage from '../views/LoginPage.vue';
import { store } from '../store/store'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/dashboard'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/dashboard'
      },
      {
        path: 'dashboard',
        component: () => import('@/views/DashboardPage.vue')
      },
      {
        path: 'bets',
        component: () => import('@/views/BetPage.vue')
      },
      {
        path: 'communities',
        component: () => import('@/views/CommunityPage.vue')
      },
      {
        path: 'leaderboard',
        component: () => import('@/views/LeaderboardPage.vue')
      },
      {
        path: 'admin',
        component: () => import('@/views/AdminPage.vue')
      }
    ],
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    component: LoginPage
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const isAuthenticated = store.getters.getUser;
    if (!isAuthenticated) {
      next('/login');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
