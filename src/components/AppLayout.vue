<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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
  ChevronDown
} from 'lucide-vue-next'
import { useUserStore } from '../stores/userStore'
import { useTheme } from '../composables/useTheme'
import LotusLogo from './LotusLogo.vue'
import ThemeToggle from './ThemeToggle.vue'
import { useClickOutside } from '../composables/useClickOutside'

const route = useRoute()
const router = useRouter()
const isMenuOpen = ref(false)
const openDropdown = ref<string | null>(null)
const navRef = ref<HTMLElement | null>(null)
const { theme } = useTheme()
const userStore = useUserStore()

const user = computed(() => userStore.user)

interface NavLink { kind: 'link'; href: string; label: string; icon: object }
interface NavGroup { kind: 'group'; label: string; icon: object; items: { href: string; label: string; icon: object }[] }
type NavEntry = NavLink | NavGroup

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
      { href: '/dashboard/contatos', label: 'Protetores', icon: Heart },
    { href: '/dashboard/historico-panico', label: 'Histórico', icon: History }
  )
  
  return items
})

const navGroups = computed<NavEntry[]>(() => {
  const isAdmin = user.value?.tipo === 'admin'
  const isAgente = user.value?.tipo === 'agente'
  const pessoas: NavGroup = {
    kind: 'group', label: 'Pessoas', icon: Heart,
    items: [
    { href: '/dashboard/contatos', label: 'Protetores', icon: Heart },
      { href: '/dashboard/historico-panico', label: 'Histórico', icon: History }
    ]
  }
  if (isAdmin) {
    return [
      { kind: 'link', href: '/dashboard/relatorios', label: 'Início', icon: BarChart3 },
      { kind: 'group', label: 'Gerenciar', icon: ClipboardList, items: [
        { href: '/dashboard/cadastro', label: 'Cadastrar', icon: Plus },
        { href: '/dashboard/consulta', label: 'Consultar', icon: Search }
      ] },
      { kind: 'group', label: 'Território', icon: Map, items: [
        { href: '/dashboard/mapa', label: 'Mapa', icon: Map },
        { href: '/dashboard/cercamento', label: 'Cercamento', icon: Shield }
      ] },
      pessoas
    ]
  }
  if (isAgente) {
    return [
      { kind: 'link', href: '/dashboard/inicio', label: 'Início', icon: Home },
      { kind: 'group', label: 'Patrulha', icon: Shield, items: [
        { href: '/dashboard/monitoramento', label: 'Monitoramento', icon: ClipboardList },
        { href: '/dashboard/cercamento', label: 'Cercamento', icon: Shield }
      ] },
      { kind: 'link', href: '/dashboard/consulta', label: 'Consultar', icon: Search },
      pessoas
    ]
  }
  return [
    { kind: 'link', href: '/dashboard', label: 'Início', icon: Home },
    { kind: 'link', href: '/dashboard/cercamento', label: 'Cercamento', icon: Shield },
      { kind: 'link', href: '/dashboard/contatos', label: 'Protetores', icon: Heart },
    { kind: 'link', href: '/dashboard/historico-panico', label: 'Histórico', icon: History }
  ]
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

const toggleDropdown = (label: string) => {
  openDropdown.value = openDropdown.value === label ? null : label
}

const closeDropdown = () => {
  openDropdown.value = null
}

const groupActive = (items: { href: string }[]) => items.some((i) => isActivePath(i.href))

watch(route, closeDropdown)

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeDropdown()
    closeMenu()
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
useClickOutside(navRef, closeDropdown)
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Ambient background for glass cards -->
    <div aria-hidden="true" class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div class="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      <div class="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <div class="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
    </div>
    <!-- Main Content Area -->
    <div>
      <!-- Header -->
      <header
        class="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/50 shadow-lg"
      >
        <div class="px-3 sm:px-4 md:px-6 lg:px-8">
          <div class="flex h-16 items-center justify-between gap-2">
            <!-- Logo and Menu Button -->
            <div class="flex items-center gap-2">
              <!-- Mobile Menu Button -->
              <button
                @click="isMenuOpen = !isMenuOpen"
                class="lg:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <Menu class="w-6 h-6" />
              </button>
              <router-link to="/dashboard" class="flex items-center hover:scale-105 transition-transform">
                <LotusLogo size="sm" :variant="theme === 'dark' ? 'mono' : 'dark'" />
              </router-link>
            </div>

            <!-- Desktop Dropdown Navigation -->
            <nav ref="navRef" class="hidden lg:flex items-center gap-1">
              <template v-for="entry in navGroups" :key="entry.kind === 'link' ? entry.href : entry.label">
                <router-link
                  v-if="entry.kind === 'link'"
                  :to="entry.href"
                  class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  :class="isActivePath(entry.href)
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'hover:bg-secondary/50 text-foreground'"
                >
                  <component :is="entry.icon" class="w-4 h-4" />
                  <span>{{ entry.label }}</span>
                </router-link>
                <div v-else class="relative">
                  <button
                    @click="toggleDropdown(entry.label)"
                    type="button"
                    :aria-expanded="openDropdown === entry.label"
                    class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    :class="groupActive(entry.items) || openDropdown === entry.label
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'hover:bg-secondary/50 text-foreground'"
                  >
                    <component :is="entry.icon" class="w-4 h-4" />
                    <span>{{ entry.label }}</span>
                    <ChevronDown class="w-4 h-4 transition-transform" :class="openDropdown === entry.label && 'rotate-180'" />
                  </button>
                  <div
                    v-if="openDropdown === entry.label"
                    class="absolute left-0 top-full mt-2 w-56 rounded-xl border border-border bg-popover p-1.5 shadow-xl animate-scale-in"
                  >
                    <router-link
                      v-for="item in entry.items"
                      :key="item.href"
                      :to="item.href"
                      @click="closeDropdown"
                      class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                      :class="isActivePath(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary/50 text-foreground'"
                    >
                      <component :is="item.icon" class="w-4 h-4" />
                      <span>{{ item.label }}</span>
                    </router-link>
                  </div>
                </div>
              </template>
            </nav>

            <!-- User Section -->
            <div class="flex items-center gap-2">
              <ThemeToggle />
              <div class="hidden lg:flex w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent items-center justify-center text-white">
                <span class="text-sm font-bold">{{ user?.nome?.charAt(0).toUpperCase() }}</span>
              </div>
              <button
                @click="handleLogout"
                class="hidden lg:flex p-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-destructive"
                title="Sair"
              >
                <LogOut class="w-5 h-5" />
              </button>
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
            >
              <LogOut class="w-5 h-5" />
              <span>Sair</span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Main Content (centered column with empty side gutters, except full-bleed map routes) -->
      <main
        class="relative z-10 pb-20 px-4 py-4"
        :class="route.path === '/dashboard/mapa' || route.path === '/dashboard/cercamento' ? '' : 'mx-auto w-full max-w-6xl'"
      >
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
