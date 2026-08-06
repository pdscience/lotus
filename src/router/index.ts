import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'BoasVindas',
    component: () => import('../views/BoasVindasView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/dashboard',
    component: () => import('../components/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/DashboardView.vue')
      },
      {
        path: 'cadastro',
        name: 'Cadastro',
        component: () => import('../views/CadastroView.vue'),
        meta: { roles: ['admin'] }
      },
      {
        path: 'consulta',
        name: 'Consulta',
        component: () => import('../views/ConsultaView.vue')
      },
      {
        path: 'mapa',
        name: 'Mapa',
        component: () => import('../views/MapaView.vue'),
        meta: { roles: ['admin'] }
      },
      {
        path: 'contatos',
        name: 'Contatos',
        component: () => import('../views/ContatosView.vue')
      },
      {
        path: 'relatorios',
        name: 'Relatorios',
        component: () => import('../views/RelatoriosView.vue'),
        meta: { roles: ['admin'] }
      },
      {
        path: 'aconselhamento',
        name: 'Aconselhamento',
        component: () => import('../views/AconselhamentoView.vue')
      },
      {
        path: 'cercamento',
        name: 'Cercamento',
        component: () => import('../views/CercamentoView.vue')
      },
      {
        path: 'rede-apoio',
        name: 'RedeApoio',
        component: () => import('../views/RedeApoioView.vue')
      },
      {
        path: 'medida/:id',
        name: 'MedidaDetail',
        component: () => import('../views/MedidaDetailView.vue')
      },
      {
        path: 'historico-panico',
        name: 'HistoricoPanico',
        component: () => import('../views/HistoricoPanicoView.vue')
      },
      {
        path: 'monitoramento',
        name: 'AgenteMonitoramento',
        component: () => import('../views/AgenteMonitoramentoView.vue'),
        meta: { roles: ['agente', 'admin'] }
      },
      {
        path: 'inicio',
        name: 'AgenteInicio',
        component: () => import('../views/AgenteInicioView.vue'),
        meta: { roles: ['agente'] }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

let isInitialized = false

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()

  if (!isInitialized) {
    await userStore.init()
    isInitialized = true
  }

  const user = userStore.user

  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else if (to.path === '/login' && user) {
    if (user.tipo === 'admin') next('/dashboard/relatorios')
    else if (user.tipo === 'agente') next('/dashboard/inicio')
    else next('/dashboard')
  } else if (to.path === '/' && user) {
    if (user.tipo === 'admin') next('/dashboard/relatorios')
    else if (user.tipo === 'agente') next('/dashboard/inicio')
    else next('/dashboard')
  } else if (to.path === '/dashboard' && user?.tipo === 'admin') {
    next('/dashboard/relatorios')
  } else if (to.path === '/dashboard' && user?.tipo === 'agente') {
    next('/dashboard/inicio')
  } else if (to.meta.roles) {
    const roles = to.meta.roles as string[]
    if (user && roles.includes(user.tipo)) {
      next()
    } else {
      if (user?.tipo === 'admin') next('/dashboard/relatorios')
      else if (user?.tipo === 'agente') next('/dashboard/inicio')
      else next('/dashboard')
    }
  } else {
    next()
  }
})

export default router
