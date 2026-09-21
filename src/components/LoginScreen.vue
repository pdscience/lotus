<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, Lock, Mail, Shield, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-vue-next'
import ProtegidaLogo from './ProtegidaLogo.vue'

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'login', username: string, password: string): boolean
}>()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  
  if (!username.value || !password.value) {
    error.value = 'Por favor, preencha todos os campos'
    return
  }

  isLoading.value = true
  
  // Simulate authentication delay
  setTimeout(() => {
    const success = emit('login', username.value, password.value)
    isLoading.value = false
    
    if (!success) {
      error.value = 'E-mail ou senha incorretos. Por favor, tente novamente.'
    }
  }, 1000)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/15 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse-slow" />
      <div class="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent rounded-full blur-2xl animate-bounce-slow" />
    </div>

    <div class="w-full max-w-md mx-auto relative z-10 px-4 animate-fade-in-up">
      <!-- Header -->
      <div class="text-center mb-8">
        <!-- Logo -->
        <div class="flex justify-center mb-6">
          <ProtegidaLogo size="md" />
        </div>

        <h1 class="text-2xl sm:text-3xl font-bold text-gradient mb-2">
          Bem-vindo ao Sistema de Acesso a Medidas Protetivas e Ações de Resposta Emergenciais
        </h1>
        <p class="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Acesse sua conta para continuar
        </p>
      </div>

      <!-- Login Card -->
      <div class="animate-fade-in-up" style="animation-delay: 0.2s">
        <div class="bg-card shadow-2xl border border-border/30 rounded-xl">
          <div class="text-center pb-6 pt-6 px-6">
            <div class="flex items-center justify-center gap-3 text-xl mb-2">
              <div class="p-2 rounded-lg bg-primary/10 text-primary">
                <Shield class="w-5 h-5" />
              </div>
              Login Seguro
            </div>
            <p class="text-sm text-muted-foreground">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          <div class="px-6 pb-6">
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Username Field -->
              <div>
                <label class="text-sm font-semibold text-foreground/80 mb-2 block">
                  E-mail ou Usuário
                </label>
                <div class="relative">
                  <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    v-model="username"
                    type="text"
                    placeholder="seu@email.com"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 backdrop-blur-sm pl-10 pr-4 py-3 text-sm transition-all duration-300 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    :class="{ 'border-destructive': error && !username }"
                  />
                </div>
                <p v-if="error && !username" class="text-destructive text-xs mt-1">Campo obrigatório</p>
              </div>

              <!-- Password Field -->
              <div>
                <label class="text-sm font-semibold text-foreground/80 mb-2 block">
                  Senha
                </label>
                <div class="relative">
                  <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 backdrop-blur-sm pl-10 pr-12 py-3 text-sm transition-all duration-300 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    :class="{ 'border-destructive': error && !password }"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <EyeOff v-if="showPassword" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
                <p v-if="error && !password" class="text-destructive text-xs mt-1">Campo obrigatório</p>
              </div>

              <!-- Error Message -->
              <div
                v-if="error"
                class="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in-up"
              >
                <AlertCircle class="w-4 h-4" />
                {{ error }}
              </div>

              <!-- Demo Account Info -->
              <div class="p-4 rounded-lg bg-info/10 border border-info/20 text-info text-sm">
                <div class="flex items-center gap-2 mb-2">
                  <CheckCircle class="w-4 h-4" />
                  <span class="font-semibold">Conta Demo Disponível</span>
                </div>
                <div class="space-y-1 text-xs">
                  <p><strong>E-mail:</strong> john@doe.com</p>
                  <p><strong>Senha:</strong> johndoe123</p>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style="background: linear-gradient(135deg, hsl(340, 75%, 55%) 0%, hsl(320, 70%, 60%) 50%, hsl(280, 65%, 65%) 100%)"
                :disabled="isLoading"
              >
                <div v-if="isLoading" class="flex items-center gap-2">
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </div>
                <span v-else>Entrar no Sistema</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Security Badge -->
      <div class="flex justify-center mt-6 animate-fade-in-up" style="animation-delay: 0.4s">
        <div class="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 backdrop-blur-sm border border-border/30 text-sm">
          <Shield class="w-3 h-3 text-primary" />
          Conexão Segura e Criptografada
        </div>
      </div>

      <!-- Back Button -->
      <div class="flex justify-center mt-6 animate-fade-in-up" style="animation-delay: 0.5s">
        <button
          @click="emit('back')"
          class="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          Voltar ao Início
        </button>
      </div>
    </div>
  </div>
</template>
