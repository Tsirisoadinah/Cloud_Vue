import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/road-problems',
      name: 'road-problems',
      component: () => import('../views/RoadProblemsView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/logout',
      name: 'logout',
      component: () => import('../views/LogoutView.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignupView.vue'),
    },
    {
      path: '/blocked-users',
      name: 'blocked-users',
      component: () => import('../views/BloquedUsers.vue'),
    },
    {
      path: '/users-list',
      name: 'users-list',
      component: () => import('../views/UsersListView.vue'),
    },
    {
      path: '/road-problems/:id/historique',
      name: 'SignalementHistorique',
      component: () => import('../views/SignalementHistoriqueView.vue')
    }
  ],
})

export default router
