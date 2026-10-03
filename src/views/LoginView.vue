<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Scale,
  Heart,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle,
  UserPlus,
  X,
  Phone,
  FileText,
  Shield,
  AlertTriangle,
  ClipboardList,
  Mail,
  Lock,
  Check
} from 'lucide-vue-next'
import { useUserStore } from '../stores/userStore'
import LotusLogo from '../components/LotusLogo.vue'
import type { UserType } from '../types'

const router = useRouter()
const userStore = useUserStore()

const userType = ref<UserType>('vitima')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const isLoading = ref(false)
const showCadastroModal = ref(false)

const handleLogin = async () => {
  error.value = ''
  
  if (!email.value || !password.value) {
    error.value = 'Preencha todos os campos'
    return
  }
  
  isLoading.value = true
  
  try {
    const success = await userStore.login(email.value, password.value)
    
    if (success) {
      router.push('/dashboard')
    } else {
      error.value = 'Credenciais incorretas. Verifique seu e-mail e senha.'
    }
  } catch (e: any) {
    error.value = e.message || 'Erro ao fazer login'
  } finally {
    isLoading.value = false
  }
}

const setUserType = (type: UserType) => {
  userType.value = type
  error.value = ''
}
</script>

<template>
  <div class="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
    <!-- Background Image -->
    <div class="absolute inset-0">
      <img
        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80&auto=format&fit=crop"
        alt="Rede de apoio - Lótus"
        loading="lazy"
        @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
        class="w-full h-full object-cover"/>
      <div class="absolute inset-0 bg-gradient-to-b from-background/80 via-background/55 to-background"></div>
      <div class="absolute inset-x-0 -top-24 h-96 bg-primary/20 blur-3xl" aria-hidden="true"></div>
    </div>

    <div class="relative z-10 w-full max-w-lg px-4 py-12">
      <!-- Logo -->
      <div class="text-center mb-8 animate-fade-in-up">
        <LotusLogo size="lg" variant="light" class="justify-center" />
        <p class="mt-3 text-sm font-medium text-muted-foreground">
          Segurança e cuidado em um só lugar
        </p>
      </div>

      <!-- Card de Login -->
      <div class="glass-card rounded-3xl shadow-2xl p-6 sm:p-8 border border-border animate-fade-in-up">
        <h1 class="text-2xl font-bold text-center text-foreground font-heading">Bem-vindo de volta</h1>
        <p class="text-sm text-muted-foreground text-center mt-1">Entre com suas credenciais para continuar</p>

        <!-- Seleção de Tipo -->
        <div class="mt-7">
          <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Tipo de acesso</p>
          <div class="space-y-2">
            <button
              type="button"
              @click="setUserType('vitima')"
              class="w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left"
              :class="userType === 'vitima'
                ? 'border-primary/60 bg-primary/10 shadow-sm'
                : 'border-border/60 hover:border-border hover:bg-secondary/30'"
            >
              <span class="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                <Heart class="w-5 h-5" />
              </span>
              <span class="flex-1 min-w-0">
                <span class="block text-sm font-semibold text-foreground">Vítima</span>
                <span class="block text-xs text-muted-foreground">Acesso restrito para vítimas cadastradas</span>
              </span>
              <Check v-if="userType === 'vitima'" class="w-4 h-4 text-primary flex-shrink-0" />
            </button>

            <button
              type="button"
              @click="setUserType('admin')"
              class="w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left"
              :class="userType === 'admin'
                ? 'border-accent/60 bg-accent/10 shadow-sm'
                : 'border-border/60 hover:border-border hover:bg-secondary/30'"
            >
              <span class="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center flex-shrink-0">
                <Scale class="w-5 h-5" />
              </span>
              <span class="flex-1 min-w-0">
                <span class="block text-sm font-semibold text-foreground">Administrador</span>
                <span class="block text-xs text-muted-foreground">Gestores e responsáveis pelo sistema</span>
              </span>
              <Check v-if="userType === 'admin'" class="w-4 h-4 text-accent flex-shrink-0" />
            </button>

            <button
              type="button"
              @click="setUserType('agente')"
              class="w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left"
              :class="userType === 'agente'
                ? 'border-blue-500/60 bg-blue-500/10 shadow-sm'
                : 'border-border/60 hover:border-border hover:bg-secondary/30'"
            >
              <span class="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center flex-shrink-0">
                <ClipboardList class="w-5 h-5" />
              </span>
              <span class="flex-1 min-w-0">
                <span class="block text-sm font-semibold text-foreground">Agente</span>
                <span class="block text-xs text-muted-foreground">Agentes de segurança (PM, PC, GCM, MP)</span>
              </span>
              <Check v-if="userType === 'agente'" class="w-4 h-4 text-blue-500 flex-shrink-0" />
            </button>
          </div>
        </div>

        <!-- Formulário -->
        <form @submit.prevent="handleLogin" class="mt-6 space-y-4">
          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">E-mail</label>
            <div class="relative">
              <Mail class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                v-model="email"
                type="email"
                placeholder="seu@email.com"
                autofocus
                class="w-full h-12 rounded-xl border border-border/50 bg-input/50 pl-11 pr-4 text-base focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">Senha</label>
            <div class="relative">
              <Lock class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full h-12 rounded-xl border border-border/50 bg-input/50 pl-11 pr-12 text-base focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <Eye v-if="!showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Erro -->
          <div v-if="error" class="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle class="w-4 h-4 flex-shrink-0" />
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:opacity-95 active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
            <LogIn v-else class="w-5 h-5" />
            {{ isLoading ? 'Entrando...' : 'Entrar' }}
          </button>

          <!-- Separador -->
          <div class="flex items-center gap-3" aria-hidden="true">
            <div class="h-px flex-1 bg-border/60"></div>
            <span class="text-xs text-muted-foreground">ou</span>
            <div class="h-px flex-1 bg-border/60"></div>
          </div>

          <!-- Botão Cadastrar -->
          <button
            type="button"
            @click="showCadastroModal = true"
            :disabled="isLoading"
            class="w-full h-12 rounded-xl font-semibold bg-transparent border border-border text-foreground transition-all duration-300 flex items-center justify-center gap-2 hover:bg-secondary/50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <UserPlus class="w-5 h-5" />
            Cadastrar-se
          </button>
        </form>

        <!-- Nota de segurança -->
        <div class="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield class="w-3.5 h-3.5" />
          Conexão segura • Dados protegidos
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-muted-foreground text-sm mt-8">
        &copy; 2026 Lótus. Todos os direitos reservados.
      </p>
    </div>

    <!-- Modal de Cadastro -->
    <Teleport to="body">
      <div
        v-if="showCadastroModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="showCadastroModal = false"
      >
        <div class="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
          <div class="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10">
            <h2 class="text-xl font-bold text-foreground flex items-center gap-2">
              <UserPlus class="w-5 h-5 text-primary" />
              Informações de Cadastro
            </h2>
            <button
              @click="showCadastroModal = false"
              class="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 space-y-6">
            <!-- Cadastro Vítima -->
            <div class="bg-secondary/30 rounded-xl p-5 border border-border">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <Heart class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-foreground">Cadastro de Vítima</h3>
                  <p class="text-sm text-muted-foreground">Acesso para mulheres em situação de violência</p>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex items-start gap-2">
                  <FileText class="w-4 h-4 text-blue-500 mt-1" />
                  <p class="text-sm text-foreground"><span class="font-medium">Documentação:</span> RG, CPF, comprovante de residência</p>
                </div>
                <div class="flex items-start gap-2">
                  <Phone class="w-4 h-4 text-blue-500 mt-1" />
                  <p class="text-sm text-foreground"><span class="font-medium">Contato:</span> Telefone para ligação e mensagens</p>
                </div>
                <div class="flex items-start gap-2">
                  <Shield class="w-4 h-4 text-blue-500 mt-1" />
                  <p class="text-sm text-foreground"><span class="font-medium">Medida Protetiva:</span> Número do processo judicial (se houver)</p>
                </div>
              </div>
              <div class="mt-4 pt-4 border-t border-border">
                <p class="text-xs text-muted-foreground flex items-center gap-2">
                  <AlertTriangle class="w-4 h-4" />
                  O cadastro será analisado pela equipe responsável
                </p>
              </div>
            </div>

            <!-- Cadastro Admin -->
            <div class="bg-secondary/30 rounded-xl p-5 border border-border">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <Scale class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-foreground">Cadastro de Administrador</h3>
                  <p class="text-sm text-muted-foreground">Acesso para gestores e responsáveis pelo sistema</p>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex items-start gap-2">
                  <FileText class="w-4 h-4 text-purple-500 mt-1" />
                  <p class="text-sm text-foreground"><span class="font-medium">Documentação:</span> Credencial institucional</p>
                </div>
                <div class="flex items-start gap-2">
                  <Phone class="w-4 h-4 text-purple-500 mt-1" />
                  <p class="text-sm text-foreground"><span class="font-medium">Contato:</span> Telefone institucional</p>
                </div>
                <div class="flex items-start gap-2">
                  <Shield class="w-4 h-4 text-purple-500 mt-1" />
                  <p class="text-sm text-foreground"><span class="font-medium">Autorização:</span> Criado pela equipe técnica</p>
                </div>
              </div>
              <div class="mt-4 pt-4 border-t border-border">
                <p class="text-xs text-muted-foreground flex items-center gap-2">
                  <AlertTriangle class="w-4 h-4" />
                  Admin deve ser criado pela equipe de TI
                </p>
              </div>
            </div>
          </div>

          <div class="p-6 border-t border-border bg-secondary/30">
            <p class="text-sm text-muted-foreground text-center">
              Para solicitado acesso, entre em contato com a equipe responsável pelo sistema.
            </p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
