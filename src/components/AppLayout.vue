<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Plus,
  Search,
  LogOut,
  Map,
  BarChart3,
  Heart,
  Menu,
  X,
  Home,
  Shield,
  History,
  ClipboardList,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import { useUserStore } from '../stores/userStore'
import ProtegidaLogo from './ProtegidaLogo.vue'
import ThemeToggle from './ThemeToggle.vue'

const route = useRoute()
const router = useRouter()
const isMenuOpen = ref(false)
const collapsed = ref(localStorage.getItem('protegida-sidebar') === 'collapsed')
const toggleSidebar = () => {
  collapsed.value = !collapsed.value
  localStorage.setItem('protegida-sidebar', collapsed.value ? 'collapsed' : 'open')
}
const userStore = useUserStore()

const user = computed(() => userStore.user)

const navigationItems = computed(() => {
  const items = []
  const isAdmin = user.value?.tipo === 'admin'
  const isAgente = user.value?.tipo === 'agente'
  
  if (isAdmin) {
    items.push(
      { href: '/dashboard/relatorios', label: 'Início', icon: BarChart3 },
      { href: '/dashboard/cadastro', label: 'Cadastrar', icon: Plus },
      { href: '/dashboard/consulta', label: 'Consultar', icon: Search },
      { href: '/dashboard/mapa', label: 'Mapa', icon: Map },
      { href: '/dashboard/cercamento', label: 'Cercamento', icon: Shield }
    )
  } else if (isAgente) {
    items.push(
      { href: '/dashboard/inicio', label: 'Início', icon: Home },
      { href: '/dashboard/monitoramento', label: 'Monitoramento', icon: ClipboardList },
      { href: '/dashboard/consulta', label: 'Consultar', icon: Search },
      { href: '/dashboard/cercamento', label: 'Cercamento', icon: Shield }
    )
  } else {
    items.push(
      { href: '/dashboard', label: 'Início', icon: Home },
      { href: '/dashboard/cercamento', label: 'Cercamento', icon: Shield }
    )
  }
  
  items.push(
    { href: '/dashboard/contatos', label: 'Anjos', icon: Heart },
    { href: '/dashboard/historico-panico', label: 'Histórico', icon: History }
  )
  
  return items
})

const isActivePath = (path: string) => {
  const isAdmin = user.value?.tipo === 'admin'
  if (isAdmin) {
    if (path === '/dashboard/relatorios' && (route.path === '/dashboard' || route.path === '/dashboard/relatorios')) return true
    if (path !== '/dashboard/relatorios' && route.path.startsWith(path)) return true
    return false
  }
  if (path === '/dashboard/inicio' && route.path === '/dashboard/inicio') return true
  if (path === '/dashboard' && route.path === '/dashboard') return true
  if (path !== '/dashboard' && path !== '/dashboard/inicio' && route.path.startsWith(path)) return true
  return false
}

const handleLogout = async () => {
  isMenuOpen.value = false
  await userStore.logout()
  router.push('/login')
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Admin/Agent Sidebar - Fixed Left -->
    <aside
      v-if="user?.tipo === 'admin' || user?.tipo === 'agente'"
      class="hidden lg:flex fixed left-0 top-0 h-full bg-background border-r border-border/50 shadow-lg z-40 flex-col transition-all"
      :class="collapsed ? 'lg:w-20' : 'lg:w-64'"
    >
      <!-- Logo -->
      <div class="p-4 border-b border-border/30 flex items-center justify-between">
        <router-link to="/dashboard" class="flex items-center justify-center hover:scale-105 transition-transform">
          <ProtegidaLogo size="sm" variant="mono" />
        </router-link>
        <button
          @click="toggleSidebar"
          class="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground"
          :title="collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'"
        >
          <ChevronRight v-if="collapsed" class="w-5 h-5" />
          <ChevronLeft v-else class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 mx-3 my-2 p-3 space-y-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl border border-white/40 shadow-lg">
        <router-link
          v-for="item in navigationItems"
          :key="item.href"
          :to="item.href"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
          :class="[isActivePath(item.href)
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'hover:bg-secondary/50 text-foreground', collapsed && 'justify-center px-0']"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span v-show="!collapsed">{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- User Section -->
      <div class="p-4 border-t border-border/50">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
            <span class="text-sm font-bold">{{ user?.username?.charAt(0).toUpperCase() }}</span>
          </div>
          <div v-show="!collapsed">
            <p class="font-medium text-foreground">{{ user?.username }}</p>
            <p class="text-xs text-muted-foreground capitalize">
              {{ user?.tipo === 'admin' ? 'Administrador' : user?.tipo === 'agente' ? 'Agente de Segurança' : 'Vítima' }}
            </p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left hover:bg-red-50 text-red-600 transition-all"
        >
          <LogOut class="w-5 h-5 shrink-0" />
          <span v-show="!collapsed">Sair</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area (offset from sidebar) -->
    <div :class="user?.tipo === 'admin' || user?.tipo === 'agente' ? (collapsed ? 'lg:ml-20' : 'lg:ml-64') : ''">
      <!-- Header -->
      <header
        class="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/50 shadow-lg"
      >
        <div class="px-3 sm:px-4 md:px-6 lg:px-8">
          <div class="flex h-16 items-center justify-between">
            <!-- Logo and Menu Button -->
            <div class="flex items-center gap-2">
              <!-- Mobile Menu Button -->
              <button
                @click="isMenuOpen = !isMenuOpen"
                class="lg:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <Menu class="w-6 h-6" />
              </button>
            </div>

            <!-- Centered Title for Admin/Agent (desktop) -->
            <h1
              v-if="user?.tipo === 'admin' || user?.tipo === 'agente'"
              class="hidden lg:block text-xl font-bold text-gradient tracking-wide text-center flex-1"
            >
              Sistema Protegida — Medidas Protetivas e Ações Emergenciais
            </h1>

            <!-- User Section -->
            <div class="flex items-center gap-2">
              <ThemeToggle />
              <!-- Logout Button (hidden on admin desktop) -->
              <button
                @click="handleLogout"
                class="p-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-destructive lg:hidden"
                title="Sair"
              >
                <LogOut class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Mobile Menu Overlay -->
      <div 
        v-if="isMenuOpen" 
        class="fixed inset-0 z-50 lg:hidden"
      >
        <div class="absolute inset-0 bg-black/50" @click="closeMenu"></div>
        <div class="absolute left-0 top-0 h-full w-72 bg-background shadow-xl animate-slide-in-left">
          <div class="p-4 border-b border-border">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                  <span class="text-sm font-bold">{{ user?.username?.charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <p class="font-medium text-foreground">{{ user?.username }}</p>
                  <p class="text-xs text-muted-foreground capitalize">{{ user?.tipo === 'admin' ? 'Administrador' : 'Vítima' }}</p>
                </div>
              </div>
              <button @click="closeMenu" class="p-2 rounded-lg hover:bg-secondary/50">
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>
          <nav class="p-4 space-y-2">
            <router-link
              v-for="item in navigationItems"
              :key="item.href"
              :to="item.href"
              @click="closeMenu"
              class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
              :class="isActivePath(item.href) 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-secondary/50 text-foreground'"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span>{{ item.label }}</span>
            </router-link>
            
            <hr class="border-border my-4" />
            
            <button
              @click="handleLogout"
          class="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left hover:bg-red-50 text-red-600 transition-all"
          :class="collapsed && 'justify-center px-0'"
            >
              <LogOut class="w-5 h-5" />
              <span>Sair</span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Main Content -->
      <main class="pb-20 px-4 py-4">
        <router-view />
      </main>
    </div>

    <!-- Bottom Navigation (Mobile only - Vitima) -->
    <nav
      v-if="user?.tipo !== 'admin'"
      class="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 shadow-lg lg:hidden z-50"
    >
      <div class="flex items-center justify-around py-2">
        <router-link
          v-for="item in navigationItems"
          :key="item.href"
          :to="item.href"
          class="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all"
          :class="isActivePath(item.href)
            ? 'text-primary'
            : 'text-muted-foreground'"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="text-xs">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>
