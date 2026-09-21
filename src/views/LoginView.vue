<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Scale,
  Heart,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  UserPlus,
  X,
  Phone,
  FileText,
  Shield,
  AlertTriangle,
  ClipboardList
} from 'lucide-vue-next'
import { useUserStore } from '../stores/userStore'
import ProtegidaLogo from '../components/ProtegidaLogo.vue'
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
        alt="Rede de apoio - Protegida"
        loading="lazy"
        @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
        class="w-full h-full object-cover"/>
      <div class="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background"></div>
    </div>

    <div class="relative z-10 w-full max-w-lg px-4">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center rounded-3xl bg-card border border-border p-4 mb-4">
          <ProtegidaLogo size="md" variant="mono" />
        </div>
      </div>

      <!-- Card de Login -->
      <div class="bg-card rounded-3xl shadow-2xl p-8 border border-border">
        <!-- Seleção de Tipo -->
        <div class="flex rounded-xl bg-secondary/50 p-1 mb-6">
          <button
            @click="setUserType('vitima')"
            :class="[
              'flex-1 py-3 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 text-sm',
              userType === 'vitima' 
                ? 'bg-rose-500 text-white shadow-lg' 
                : 'text-muted-foreground hover:bg-secondary/50'
            ]">
            <Heart class="w-4 h-4" />
            Vítima
          </button>
          <button
            @click="setUserType('admin')"
            :class="[
              'flex-1 py-3 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 text-sm',
              userType === 'admin' 
                ? 'bg-primary text-primary-foreground shadow-lg' 
                : 'text-muted-foreground hover:bg-secondary/50'
            ]"
          >
            <Scale class="w-4 h-4" />
            Administrador
          </button>
          <button
            @click="setUserType('agente')"
            :class="[
              'flex-1 py-3 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 text-sm',
              userType === 'agente' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-muted-foreground hover:bg-secondary/50'
            ]"
          >
            <ClipboardList class="w-4 h-4" />
            Agente
          </button>
        </div>

        <!-- Formulário -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">E-mail</label>
            <input
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              class="w-full h-12 rounded-xl border border-border/50 bg-input/50 px-4 text-base focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">Senha</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full h-12 rounded-xl border border-border/50 bg-input/50 px-4 pr-12 text-base focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
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
          <div v-if="error" class="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle class="w-4 h-4 flex-shrink-0" />
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full h-12 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2"
            :class="userType === 'vitima' 
              ? 'bg-rose-500 hover:bg-rose-600' 
              : userType === 'agente'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-primary hover:bg-primary/90'"
          >
            <LogIn class="w-5 h-5" />
            {{ isLoading ? 'Entrando...' : 'Entrar' }}
          </button>

          <!-- Botão Cadastrar -->
          <button
            type="button"
            @click="showCadastroModal = true"
            :disabled="isLoading"
            class="w-full h-12 mt-3 rounded-xl font-semibold bg-transparent border-2 border-border text-foreground transition-all duration-300 flex items-center justify-center gap-2 hover:bg-secondary/50"
          >
            <UserPlus class="w-5 h-5" />
            Cadastrar-se
          </button>
        </form>

        <!-- Credenciais de Teste -->
        <div class="mt-6 p-4 rounded-xl bg-secondary/30">
          <p class="text-xs text-muted-foreground text-center">
            Acesso a Medidas Protetivas e Ações de Resposta Emergenciais
          </p>
        </div>

        <!-- Info do Tipo -->
        <div class="mt-6 text-center">
          <p v-if="userType === 'admin'" class="text-sm text-muted-foreground">
            Acesso para gestores e responsáveis pelo sistema
          </p>
          <p v-else-if="userType === 'agente'" class="text-sm text-muted-foreground">
            Acesso para agentes de segurança (PM, PC, GCM, MP)
          </p>
          <p v-else class="text-sm text-muted-foreground">
            Acesso restrito para vítimas cadastradas
          </p>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-muted-foreground text-sm mt-8">
        &copy; 2026 Protegida. Todos os direitos reservados.
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
                <div class="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white">
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
