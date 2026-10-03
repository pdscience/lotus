<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import {
  Calendar,
  Heart,
  FileText,
  User,
  Phone,
  Home,
  Camera,
  Save,
  X,
  Users,
  Siren,
  Sparkles,
  ArrowRight,
} from "lucide-vue-next";
import PanicButton from "../components/PanicButton.vue";
import LotusLogo from "../components/LotusLogo.vue";
import SectionHeader from "../components/SectionHeader.vue";
import StatCard from "../components/StatCard.vue";
import { fetchContatosAnjo } from "../services/contatoAnjoService";
import { fetchMedidasVitima } from "../services/medidaVitimaService";
import { fetchPanicRecords, type PanicRecord } from "../services/panicService";
import { fetchUsuario, saveUsuario } from "../services/usuarioService";
import { isConfigured, gerarApoio } from "../services/iaAconselhamentoService";
import { useUserStore } from "../stores/userStore";

const userStore = useUserStore()
const user = computed(() => userStore.user);

const contatosCount = ref(0);
const medidaVitima = ref<any>(null);
const panicos30d = ref(0);
const atividadeRecente = ref<PanicRecord[]>([]);

const isAdmin = computed(() => user.value?.tipo === "admin");
const saudacao = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
});
const hoje = computed(() => new Date().toLocaleDateString("pt-BR", { weekday: 'long', day: 'numeric', month: 'long' }));
const ctaLabel = "Acessar rede de apoio";
const medidaAtiva = computed(() => medidaVitima.value?.status === "ativa" ? "1" : medidaVitima.value ? "0" : "0");
const resumoIa = ref("");

onMounted(async () => {
  await userStore.init();
  const contatos = await fetchContatosAnjo();
  contatosCount.value = contatos.length;
  const medidas = await fetchMedidasVitima();
  medidaVitima.value = medidas[0] || null;

  const panicos = await fetchPanicRecords();
  const limite = Date.now() - 30 * 24 * 60 * 60 * 1000;
  panicos30d.value = panicos.filter((p) => p.timestamp >= limite).length;
  atividadeRecente.value = [...panicos]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  const usuario = await fetchUsuario();
  if (usuario) {
    profileForm.value.nomeCompleto = usuario.nome || "";
    profileForm.value.cpf = usuario.cpf || "";
    profileForm.value.telefonePrincipal = usuario.telefone || "";
    profileForm.value.dataNascimento = usuario.data_nascimento || "";
    profileForm.value.endereco = usuario.endereco || "";
  }

  if (isConfigured()) {
    try {
      resumoIa.value = await gerarApoio('Resuma em 2 frases a situação de proteção da usuária.');
    } catch {
      resumoIa.value = '';
    }
  }
})

// Profile modal state
const isProfileModalOpen = ref(false);
const profilePhoto = ref<string | null>(null);

const profileForm = ref({
  nomeCompleto: "",
  dataNascimento: "",
  cpf: "",
  rg: "",
  telefonePrincipal: "",
  telefoneSecundario: "",
  email: "",
  endereco: "",
  cidade: "",
  uf: "",
  cep: "",
  complemento: "",
  pontoReferencia: "",
});

const openProfileModal = () => {
  isProfileModalOpen.value = true;
};

const closeProfileModal = () => {
  isProfileModalOpen.value = false;
};

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profilePhoto.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const saveProfile = async () => {
  const result = await saveUsuario({
    nome: profileForm.value.nomeCompleto,
    cpf: profileForm.value.cpf || undefined,
    telefone: profileForm.value.telefonePrincipal || undefined,
    data_nascimento: profileForm.value.dataNascimento || undefined,
    endereco: [
      profileForm.value.endereco,
      profileForm.value.cidade,
      profileForm.value.uf,
      profileForm.value.cep,
      profileForm.value.complemento
    ].filter(Boolean).join(', ') || undefined
  });

  if (result.error) {
    alert(result.error);
    return;
  }

  closeProfileModal();
};

const formatarData = (data: string) => {
  return new Date(data).toLocaleDateString("pt-BR");
};

const formatarDataHora = (ts: number) => {
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ativa":
      return "bg-success/10 text-success border border-success/20";
    case "encerrada":
      return "bg-secondary text-muted-foreground border border-border";
    case "revogada":
      return "bg-destructive/10 text-destructive border border-destructive/20";
    default:
      return "bg-secondary text-muted-foreground border border-border";
  }
};
</script>

<template>
  <div class="bg-background">
    <main class="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
      <SectionHeader v-if="!isAdmin">
        <template #title>Meu painel</template>
        <template #desc>Visão geral da sua proteção</template>
      </SectionHeader>

      <div v-if="!isAdmin" class="rounded-2xl border border-border glass-card p-4 sm:p-5 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-lg animate-fade-in-up">
        <div>
          <p class="font-heading font-bold text-lg text-foreground">{{ saudacao }}</p>
          <p class="text-sm text-muted-foreground">{{ hoje }}</p>
        </div>
        <router-link to="/dashboard/rede-apoio" class="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.99] transition-all px-4 py-2 text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
          {{ ctaLabel }}
          <ArrowRight class="w-4 h-4" />
        </router-link>
      </div>

      <div
        v-if="!isAdmin && resumoIa"
        class="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 mb-4 shadow-lg animate-fade-in-up"
      >
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Sparkles class="w-4 h-4" />
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-primary">Resumo da situação</p>
            <p class="text-sm mt-1 text-foreground">{{ resumoIa }}</p>
          </div>
        </div>
      </div>

      <!-- Bento StatCards - Apenas para Vítima -->
      <div
        v-if="!isAdmin"
        class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6"
      >
        <StatCard label="Medidas ativas" :value="medidaAtiva" accent-top />
        <StatCard label="Pânicos (30d)" :value="String(panicos30d)" accent-top />
        <StatCard label="Protetores" :value="String(contatosCount)" accent-top />
      </div>

      <!-- Quick Access Cards - Apenas para Vítima -->
      <div
        v-if="!isAdmin"
        class="grid grid-cols-2 gap-2 sm:gap-4"
      >
        <router-link
          to="/dashboard/rede-apoio"
          class="rounded-2xl border border-border glass-card p-4 sm:p-5 shadow-sm hover:shadow-lg hover:bg-secondary/40 hover:-translate-y-0.5 transition-all"
        >
          <div class="flex flex-col items-center text-center gap-2">
            <div
              class="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center"
            >
              <Siren class="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
            <div>
              <h3 class="font-semibold text-foreground text-sm">
                Rede de Apoio
              </h3>
              <p class="text-xs text-muted-foreground">Telefones úteis</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/dashboard/aconselhamento"
          class="rounded-2xl border border-border glass-card p-4 sm:p-5 shadow-sm hover:shadow-lg hover:bg-secondary/40 hover:-translate-y-0.5 transition-all"
        >
          <div class="flex flex-col items-center text-center gap-2">
            <div
              class="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
            >
              <Heart class="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
            <div>
              <h3 class="font-semibold text-foreground text-sm">
                Aconselhamento
              </h3>
              <p class="text-xs text-muted-foreground">Seus direitos</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/dashboard/contatos"
          class="rounded-2xl border border-border glass-card p-4 sm:p-5 shadow-sm hover:shadow-lg hover:bg-secondary/40 hover:-translate-y-0.5 transition-all"
        >
          <div class="flex flex-col items-center text-center gap-2">
            <div
              class="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center"
            >
              <Users class="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
            <div>
              <h3 class="font-semibold text-foreground text-sm">Meus Protetores</h3>
              <p class="text-xs text-muted-foreground">
                {{ contatosCount }} contatos
              </p>
            </div>
          </div>
        </router-link>

        <button
          @click="openProfileModal"
          class="rounded-2xl border border-border glass-card p-4 sm:p-5 shadow-sm hover:shadow-lg hover:bg-secondary/40 hover:-translate-y-0.5 transition-all"
        >
          <div class="flex flex-col items-center text-center gap-2">
            <div
              class="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-info/10 text-info flex items-center justify-center"
            >
              <User class="w-5 sm:w-6 h-5 sm:h-6" />
            </div>
            <div>
              <h3 class="font-semibold text-foreground text-sm">Perfil</h3>
              <p class="text-xs text-muted-foreground">Seus dados</p>
            </div>
          </div>
        </button>
      </div>

      <!-- Card da Medida Protetiva - Apenas para Vítima -->
      <div v-if="!isAdmin && medidaVitima" class="mt-6 sm:mt-8 mb-4 sm:mb-6">
        <div
          class="rounded-2xl border border-border glass-card overflow-hidden shadow-lg animate-fade-in-up"
        >
          <div class="bg-secondary/30 border-b border-border px-4 sm:px-6 py-3 sm:py-4">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden"
                >
                  <LotusLogo size="sm" />
                </div>
                <div>
                  <h4 class="font-heading font-semibold text-lg text-foreground">Sua Medida Protetiva</h4>
                  <p class="text-xs text-muted-foreground">
                    Informações da sua proteção
                  </p>
                </div>
              </div>
              <span
                v-if="medidaVitima"
                :class="[
                  'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize',
                  getStatusColor(medidaVitima.status),
                ]"
              >
                {{ medidaVitima.status }}
              </span>
            </div>
          </div>

          <div v-if="medidaVitima" class="p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div class="flex items-start gap-3">
                <FileText class="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nº do Processo</p>
                  <p class="font-medium text-foreground text-sm mt-0.5">
                    {{ medidaVitima.numeroProcesso }}
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Calendar class="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data de Início</p>
                  <p class="font-medium text-foreground text-sm mt-0.5">
                    {{ formatarData(medidaVitima.dataInicio) }}
                  </p>
                </div>
              </div>
            </div>

            <div class="h-px bg-border/60" />

            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Descrição:
              </p>
              <p class="text-sm text-foreground">
                {{ medidaVitima.descricao }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Atividade recente - Apenas para Vítima -->
      <div v-if="!isAdmin" class="mt-6 sm:mt-8">
        <div class="rounded-2xl border border-border glass-card p-4 sm:p-6 shadow-lg animate-fade-in-up">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
              <Siren class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-heading font-semibold text-lg text-foreground">Atividade recente</h3>
              <p class="text-xs text-muted-foreground">Últimos acionamentos de pânico</p>
            </div>
          </div>
          <ul v-if="atividadeRecente.length > 0" class="rounded-xl border border-border bg-secondary/20 divide-y divide-border">
            <li
              v-for="item in atividadeRecente"
              :key="item.id"
              class="flex gap-3 p-4"
            >
              <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium">{{ formatarDataHora(item.timestamp) }}</p>
                <p class="text-xs text-muted-foreground font-mono truncate">
                  {{ item.latitude.toFixed(4) }}, {{ item.longitude.toFixed(4) }}
                </p>
              </div>
              <router-link
                to="/dashboard/historico-panico"
                class="text-xs text-primary hover:underline flex-shrink-0"
              >
                Ver
              </router-link>
            </li>
          </ul>
          <p v-else class="text-sm text-muted-foreground">
            Nenhum acionamento recente. Os registros aparecerão aqui.
          </p>
        </div>
      </div>

      <!-- Panic Button - Para Vítimas (Maior) -->
      <div v-if="!isAdmin" class="py-6 sm:py-12">
        <div class="rounded-3xl border border-border glass-card p-6 sm:p-12 md:p-16 text-center max-w-2xl mx-auto shadow-lg animate-fade-in-up">
          <div class="flex justify-center">
            <PanicButton />
          </div>
        </div>
      </div>

      <!-- Profile Modal -->
      <div
        v-if="isProfileModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="closeProfileModal"
      >
        <div
          class="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl"
        >
          <div
            class="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10"
          >
            <h2 class="text-xl font-bold font-heading text-foreground flex items-center gap-2">
              <User class="w-5 h-5 text-primary" />
              Meu Perfil
            </h2>
            <button
              @click="closeProfileModal"
              class="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="saveProfile" class="p-6 space-y-6">
            <!-- Photo Upload -->
            <div class="flex flex-col items-center">
              <div class="relative">
                <div
                  class="w-32 h-32 rounded-full bg-secondary/30 flex items-center justify-center overflow-hidden border-4 border-primary/20"
                >
                  <img
                    v-if="profilePhoto"
                    :src="profilePhoto"
                    alt="Foto de perfil"
                    class="w-full h-full object-cover"
                  />
                  <User v-else class="w-16 h-16 text-muted-foreground" />
                </div>
                <label
                  class="absolute bottom-0 right-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera class="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    @change="handlePhotoUpload"
                    class="hidden"
                  />
                </label>
              </div>
              <p class="text-sm text-muted-foreground mt-2">
                Clique na câmera para adicionar foto
              </p>
            </div>

            <!-- Personal Information -->
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <User class="w-4 h-4" />
                </div>
                <h3 class="font-heading font-semibold text-lg text-foreground">Informações Pessoais</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-foreground mb-2 block"
                    >Nome Completo *</label
                  >
                  <input
                    v-model="profileForm.nomeCompleto"
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label class="text-sm font-medium text-foreground mb-2 block"
                    >Data de Nascimento</label
                  >
                  <input
                    v-model="profileForm.dataNascimento"
                    type="date"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label class="text-sm font-medium text-foreground mb-2 block"
                    >CPF</label
                  >
                  <input
                    v-model="profileForm.cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label class="text-sm font-medium text-foreground mb-2 block"
                    >RG</label
                  >
                  <input
                    v-model="profileForm.rg"
                    type="text"
                    placeholder="Número do RG"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                  <Phone class="w-4 h-4" />
                </div>
                <h3 class="font-heading font-semibold text-lg text-foreground">Informações de Contato</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-foreground mb-2 block"
                    >Telefone Principal *</label
                  >
                  <input
                    v-model="profileForm.telefonePrincipal"
                    type="tel"
                    required
                    placeholder="(00) 00000-0000"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label class="text-sm font-medium text-foreground mb-2 block"
                    >Telefone Secundário</label
                  >
                  <input
                    v-model="profileForm.telefoneSecundario"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div class="md:col-span-2">
                  <label class="text-sm font-medium text-foreground mb-2 block"
                    >E-mail</label
                  >
                  <input
                    v-model="profileForm.email"
                    type="email"
                    placeholder="seu@email.com"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <!-- Address Information -->
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                  <Home class="w-4 h-4" />
                </div>
                <h3 class="font-heading font-semibold text-lg text-foreground">Endereço</h3>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="text-sm font-medium text-foreground mb-2 block"
                    >Endereço</label
                  >
                  <input
                    v-model="profileForm.endereco"
                    type="text"
                    placeholder="Rua, número, bairro"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label class="text-sm font-medium text-foreground mb-2 block"
                    >Cidade</label
                  >
                  <input
                    v-model="profileForm.cidade"
                    type="text"
                    placeholder="Cidade"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label class="text-sm font-medium text-foreground mb-2 block"
                    >UF</label
                  >
                  <input
                    v-model="profileForm.uf"
                    type="text"
                    maxlength="2"
                    placeholder="SP"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label class="text-sm font-medium text-foreground mb-2 block"
                    >CEP</label
                  >
                  <input
                    v-model="profileForm.cep"
                    type="text"
                    placeholder="00000-000"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label class="text-sm font-medium text-foreground mb-2 block"
                    >Complemento</label
                  >
                  <input
                    v-model="profileForm.complemento"
                    type="text"
                    placeholder="Apto,-bloco, etc."
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div class="md:col-span-2">
                  <label class="text-sm font-medium text-foreground mb-2 block"
                    >Ponto de Referência</label
                  >
                  <input
                    v-model="profileForm.pontoReferencia"
                    type="text"
                    placeholder="Referência próxima ao endereço"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeProfileModal"
                class="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-secondary/50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.99] transition-all font-medium flex items-center justify-center gap-2"
              >
                <Save class="w-4 h-4" />
                Salvar Perfil
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>
