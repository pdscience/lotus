<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  Share2,
  Trash2,
  User,
  AlertTriangle,
  Users,
  Shield,
  CheckCircle
} from 'lucide-vue-next'
import SectionHeader from '../components/SectionHeader.vue'

interface RegistroCompleto {
  id: string
  ofendida: {
    nomeCompleto: string
    dataNascimento: string
    cpf: string
    rg?: string
    profissao?: string
    telefone: string
    email?: string
    enderecoResidencia?: {
      logradouro: string
      numero: string
      bairro: string
      cidade: string
      cep: string
    }
  }
  ofensor: {
    nomeCompleto: string
    dataNascimento: string
    cpf: string
    rg?: string
    profissao?: string
    telefone?: string
    enderecoResidencia?: {
      logradouro: string
      numero: string
      bairro: string
      cidade: string
      cep: string
    }
  }
  dependentes: Array<{
    nomeCompleto: string
    dataNascimento: string
    guarda: string
  }>
  medidaProtetiva: {
    tipoMedida: string
    numero: string
    situacao: string
    localExpedicao: string
    solicitante: string
    dataExpedicao: string
    dataVencimento?: string
    observacoes?: string
    tiposRestricao?: Record<string, any>
  }
}

const router = useRouter()

const isLoading = ref(true)

// Mock data - in real app would fetch from API
const mockRegistro: RegistroCompleto = {
  id: '1',
  ofendida: {
    nomeCompleto: 'Maria Santos Silva',
    dataNascimento: '1985-03-15',
    cpf: '123.456.789-00',
    rg: '1234567',
    profissao: 'Professora',
    telefone: '(67) 99999-9999',
    email: 'maria@email.com',
    enderecoResidencia: {
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'Campo Grande',
      cep: '79000-000'
    }
  },
  ofensor: {
    nomeCompleto: 'João Carlos Santos',
    dataNascimento: '1980-08-20',
    cpf: '987.654.321-00',
    rg: '7654321',
    profissao: 'Autônomo',
    telefone: '(67) 98888-8888',
    enderecoResidencia: {
      logradouro: 'Rua das Acácias',
      numero: '456',
      bairro: 'Vila Nova',
      cidade: 'Campo Grande',
      cep: '79000-100'
    }
  },
  dependentes: [
    {
      nomeCompleto: 'Pedro Santos Silva',
      dataNascimento: '2010-05-10',
      guarda: 'mae'
    }
  ],
  medidaProtetiva: {
    tipoMedida: 'Urgência',
    numero: '2024-0001',
    situacao: 'ativa',
    localExpedicao: 'Campo Grande - MS',
    solicitante: 'vitima',
    dataExpedicao: '2024-01-15',
    dataVencimento: '2024-04-15',
    observacoes: 'Caso de alta prioridade. Ameaças documentadas.',
    tiposRestricao: {
      afastamentoLar: true,
      proibicaoAproximacao: { ativa: true, distancia: '200' },
      proibicaoContato: true
    }
  }
}

const registro = ref<RegistroCompleto | null>(mockRegistro)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})

const getSituacaoBadge = (situacao: string) => {
  const badges = {
    ativa: { color: 'bg-success/10 text-success border-success/20', text: 'Ativa' },
    revisada: { color: 'bg-info/10 text-info border-info/20', text: 'Revisada' },
    prorrogada: { color: 'bg-warning/10 text-warning border-warning/20', text: 'Prorrogada' },
    revogada: { color: 'bg-destructive/10 text-destructive border-destructive/20', text: 'Revogada' }
  }
  return badges[situacao as keyof typeof badges] || badges.ativa
}

const formatarData = (dataString: string) => {
  try {
    return new Date(dataString).toLocaleDateString('pt-BR')
  } catch {
    return 'Data inválida'
  }
}

const formatarEndereco = (endereco: any) => {
  if (!endereco) return 'Não informado'
  const { logradouro, numero, bairro, cidade, cep } = endereco
  return [logradouro, numero, bairro, cidade, cep].filter(Boolean).join(', ') || 'Não informado'
}

const handleExcluir = () => {
  if (confirm('Tem certeza que deseja excluir esta medida protetiva? Esta ação não pode ser desfeita.')) {
    alert('Medida excluída com sucesso!')
    router.push('/dashboard/consulta')
  }
}

const handleCompartilhar = async () => {
  const texto = `Medida Protetiva: ${registro.value?.medidaProtetiva.numero}\nVítima: ${registro.value?.ofendida.nomeCompleto}\nSituação: ${registro.value?.medidaProtetiva.situacao}`

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Medida Protetiva - Protegida',
        text: texto
      })
    } catch {
      navigator.clipboard?.writeText(texto)
      alert('Dados copiados para a área de transferência!')
    }
  } else {
    navigator.clipboard?.writeText(texto)
    alert('Dados copiados para a área de transferência!')
  }
}

const situacao = computed(() => {
  if (!registro.value) return { color: 'bg-success/10 text-success border-success/20', text: 'Ativa' }
  return getSituacaoBadge(registro.value.medidaProtetiva.situacao)
})
</script>

<template>
  <div class="bg-background">
    <div class="px-3 sm:px-4 md:px-6 lg:px-8 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p class="mt-4 text-muted-foreground">Carregando detalhes...</p>
        </div>

        <!-- Not Found State -->
        <div v-else-if="!registro" class="text-center py-12">
          <AlertTriangle class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 class="text-xl font-semibold mb-2">Medida não encontrada</h2>
          <p class="text-muted-foreground mb-6">A medida protetiva solicitada não foi encontrada no sistema.</p>
          <button
            @click="router.push('/dashboard/consulta')"
            class="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-sm font-medium"
          >
            <ArrowLeft class="w-4 h-4" />
            Voltar à Consulta
          </button>
        </div>

        <!-- Content -->
        <div v-else>
          <SectionHeader>
            <template #title>{{ registro.medidaProtetiva.numero || 'Medida protetiva' }}</template>
            <template #desc>{{ registro.medidaProtetiva.tipoMedida || 'Detalhes da medida protetiva' }}</template>
            <template #actions>
              <span :class="`px-3 py-1 rounded-full text-sm font-medium border ${situacao.color}`">
                {{ situacao.text }}
              </span>
              <button @click="handleCompartilhar" class="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-sm font-medium">
                <Share2 class="w-4 h-4" />
                Compartilhar
              </button>
              <button @click="handleExcluir" class="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium">
                <Trash2 class="w-4 h-4" />
                Excluir
              </button>
            </template>
          </SectionHeader>

          <div class="space-y-4 sm:space-y-6">
            <!-- Dados da Medida -->
            <div class="rounded-lg border border-border bg-card p-6">
              <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
                <Shield class="w-5 h-5 text-primary" />
                Dados da Medida Protetiva
              </h2>
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">Número</p>
                    <p class="text-base">{{ registro.medidaProtetiva.numero || 'Não informado' }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">Tipo</p>
                    <p class="text-base">{{ registro.medidaProtetiva.tipoMedida || 'Não informado' }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">Local de Expedição</p>
                    <p class="text-base">{{ registro.medidaProtetiva.localExpedicao || 'Não informado' }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">Solicitante</p>
                    <p class="text-base">{{ registro.medidaProtetiva.solicitante || 'Não informado' }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">Data de Expedição</p>
                    <p class="text-base">{{ formatarData(registro.medidaProtetiva.dataExpedicao) }}</p>
                  </div>
                  <div v-if="registro.medidaProtetiva.dataVencimento">
                    <p class="text-sm font-medium text-muted-foreground">Data de Vencimento</p>
                    <p class="text-base">{{ formatarData(registro.medidaProtetiva.dataVencimento) }}</p>
                  </div>
                </div>

                <div v-if="registro.medidaProtetiva.observacoes">
                  <p class="text-sm font-medium text-muted-foreground">Observações</p>
                  <p class="text-base">{{ registro.medidaProtetiva.observacoes }}</p>
                </div>
              </div>
            </div>

            <!-- Dados da Ofendida -->
            <div class="rounded-lg border border-border bg-card p-6">
              <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
                <User class="w-5 h-5 text-info" />
                Dados da Ofendida (Vítima)
              </h2>
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">Nome Completo</p>
                    <p class="text-base">{{ registro.ofendida.nomeCompleto }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
                    <p class="text-base">{{ formatarData(registro.ofendida.dataNascimento) }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">CPF</p>
                    <p class="text-base">{{ registro.ofendida.cpf }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">RG</p>
                    <p class="text-base">{{ registro.ofendida.rg || 'Não informado' }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">Profissão</p>
                    <p class="text-base">{{ registro.ofendida.profissao || 'Não informado' }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">Telefone</p>
                    <p class="text-base">{{ registro.ofendida.telefone }}</p>
                  </div>
                </div>

                <div v-if="registro.ofendida.email">
                  <p class="text-sm font-medium text-muted-foreground">E-mail</p>
                  <p class="text-base">{{ registro.ofendida.email }}</p>
                </div>

                <div class="pt-4 border-t border-border">
                  <p class="text-sm font-medium text-muted-foreground mb-2">Endereço de Residência</p>
                  <p class="text-base">{{ formatarEndereco(registro.ofendida.enderecoResidencia) }}</p>
                </div>
              </div>
            </div>

            <!-- Dados do Ofensor -->
            <div class="rounded-lg border border-border bg-card p-6">
              <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
                <AlertTriangle class="w-5 h-5 text-destructive" />
                Dados do Ofensor (Agressor)
              </h2>
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">Nome Completo</p>
                    <p class="text-base">{{ registro.ofensor.nomeCompleto }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
                    <p class="text-base">{{ formatarData(registro.ofensor.dataNascimento) }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">CPF</p>
                    <p class="text-base">{{ registro.ofensor.cpf }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">RG</p>
                    <p class="text-base">{{ registro.ofensor.rg || 'Não informado' }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">Profissão</p>
                    <p class="text-base">{{ registro.ofensor.profissao || 'Não informado' }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-muted-foreground">Telefone</p>
                    <p class="text-base">{{ registro.ofensor.telefone || 'Não informado' }}</p>
                  </div>
                </div>

                <div class="pt-4 border-t border-border">
                  <p class="text-sm font-medium text-muted-foreground mb-2">Endereço de Residência</p>
                  <p class="text-base">{{ formatarEndereco(registro.ofensor.enderecoResidencia) }}</p>
                </div>
              </div>
            </div>

            <!-- Dependentes -->
            <div v-if="registro.dependentes && registro.dependentes.length > 0" class="rounded-lg border border-border bg-card p-6">
              <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
                <Users class="w-5 h-5 text-success" />
                Dependentes ({{ registro.dependentes.length }})
              </h2>
              <div class="space-y-6">
                <div
                  v-for="(dependente, index) in registro.dependentes"
                  :key="index"
                  :class="index > 0 ? 'pt-6 border-t border-border' : ''"
                >
                  <h4 class="font-medium mb-3">Dependente {{ index + 1 }}</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm font-medium text-muted-foreground">Nome</p>
                      <p class="text-base">{{ dependente.nomeCompleto }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
                      <p class="text-base">{{ formatarData(dependente.dataNascimento) }}</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p class="text-sm font-medium text-muted-foreground">Guarda</p>
                      <p class="text-base capitalize">{{ dependente.guarda }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tipos de Restrição -->
            <div v-if="registro.medidaProtetiva.tiposRestricao" class="rounded-lg border border-border bg-card p-6">
              <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
                <AlertTriangle class="w-5 h-5 text-warning" />
                Tipos de Restrição Aplicados
              </h2>
              <div class="space-y-4">
                <div v-if="registro.medidaProtetiva.tiposRestricao.afastamentoLar" class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-success" />
                  <span>Afastamento do lar, domicílio ou local de convivência</span>
                </div>
                <div v-if="registro.medidaProtetiva.tiposRestricao.proibicaoAproximacao?.ativa" class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-success" />
                  <span>Proibição de aproximação ({{ registro.medidaProtetiva.tiposRestricao.proibicaoAproximacao.distancia || '100' }} metros)</span>
                </div>
                <div v-if="registro.medidaProtetiva.tiposRestricao.proibicaoContato" class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-success" />
                  <span>Proibição de contato</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
