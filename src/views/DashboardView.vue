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
} from "lucide-vue-next";
import PanicButton from "../components/PanicButton.vue";
import { fetchContatosAnjo } from "../services/contatoAnjoService";
import { fetchMedidasVitima } from "../services/medidaVitimaService";
import { fetchUsuario, saveUsuario } from "../services/usuarioService";
import { useUserStore } from "../stores/userStore";

const userStore = useUserStore()
const user = computed(() => userStore.user);

const contatosCount = ref(0);
const medidaVitima = ref<any>(null);

const isAdmin = computed(() => user.value?.tipo === "admin");

onMounted(async () => {
  await userStore.init();
  const contatos = await fetchContatosAnjo();
  contatosCount.value = contatos.length;
  const medidas = await fetchMedidasVitima();
  medidaVitima.value = medidas[0] || null;

  const usuario = await fetchUsuario();
  if (usuario) {
    profileForm.value.nomeCompleto = usuario.nome || "";
    profileForm.value.cpf = usuario.cpf || "";
    profileForm.value.telefonePrincipal = usuario.telefone || "";
    profileForm.value.dataNascimento = usuario.data_nascimento || "";
    profileForm.value.endereco = usuario.endereco || "";
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "ativa":
      return "bg-green-100 text-green-700";
    case "encerrada":
      return "bg-gray-100 text-gray-700";
    case "revogada":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};
</script>

<template>
  <div class="bg-gradient-to-br from-background via-secondary/5 to-primary/5">
    <main class="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
      <!-- Quick Access Cards - Apenas para Vítima -->
      <div
        v-if="!isAdmin"
        class="grid grid-cols-2 gap-2 sm:gap-4"
      >
        <router-link
          to="/dashboard/rede-apoio"
          class="bg-white rounded-xl shadow-md p-4 sm:p-5 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in-up"
          style="animation-delay: 0.1s"
        >
          <div class="flex flex-col items-center text-center gap-2">
            <div
              class="w-12 sm:w-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white"
            >
              <span class="text-xl sm:text-2xl">🚨</span>
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
          class="bg-white rounded-xl shadow-md p-4 sm:p-5 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in-up"
          style="animation-delay: 0.15s"
        >
          <div class="flex flex-col items-center text-center gap-2">
            <div
              class="w-12 sm:w-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white"
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
          class="bg-white rounded-xl shadow-md p-4 sm:p-5 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in-up"
          style="animation-delay: 0.2s"
        >
          <div class="flex flex-col items-center text-center gap-2">
            <div
              class="w-12 sm:w-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white"
            >
              <span class="text-xl sm:text-2xl">👼</span>
            </div>
            <div>
              <h3 class="font-semibold text-foreground text-sm">Meus Anjos</h3>
              <p class="text-xs text-muted-foreground">
                {{ contatosCount }} contatos
              </p>
            </div>
          </div>
        </router-link>

        <button
          @click="openProfileModal"
          class="bg-white rounded-xl shadow-md p-4 sm:p-5 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in-up"
          style="animation-delay: 0.25s"
        >
          <div class="flex flex-col items-center text-center gap-2">
            <div
              class="w-12 sm:w-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white"
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
      <div v-if="!isAdmin && medidaVitima" class="mt-6 sm:mt-8 mb-4 sm:mb-6 animate-fade-in-up">
        <div
          class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div class="bg-gradient-to-r from-primary to-accent px-4 sm:px-6 py-3 sm:py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-20 h-20 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden shadow-lg"
                >
                  <img src="@/assets/Logo AMPARE.png" alt="AMPARE Logo" class="w-18 h-18 object-contain" />
                </div>
                <div>
                  <h4 class="font-bold text-white">Sua Medida Protetiva</h4>
                  <p class="text-xs text-white/80">
                    Informações da sua proteção
                  </p>
                </div>
              </div>
              <span
                v-if="medidaVitima"
                :class="[
                  'px-5 py-2 rounded-full text-xs font-medium capitalize',
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
                  <p class="text-xs text-muted-foreground">Nº do Processo</p>
                  <p class="font-medium text-foreground text-sm">
                    {{ medidaVitima.numeroProcesso }}
                  </p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Calendar class="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p class="text-xs text-muted-foreground">Data de Início</p>
                  <p class="font-medium text-foreground text-sm">
                    {{ formatarData(medidaVitima.dataInicio) }}
                  </p>
                </div>
              </div>
            </div>

            <hr class="border-gray-200" />

            <div>
              <p class="text-xs text-muted-foreground mb-2">
                Descrição:
              </p>
              <p class="text-sm text-foreground">
                {{ medidaVitima.descricao }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Panic Button - Para Vítimas (Maior) -->
      <div v-if="!isAdmin" class="py-6 sm:py-12">
        <div class="bg-white rounded-3xl p-6 sm:p-12 md:p-16 text-center shadow-xl border border-gray-200 max-w-2xl mx-auto">
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
          class="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
        >
          <div
            class="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10"
          >
            <h2 class="text-xl font-bold text-foreground">Meu Perfil</h2>
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
                  class="absolute bottom-0 right-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
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
              <h3 class="font-semibold text-foreground flex items-center gap-2">
                <User class="w-4 h-4" />
                Informações Pessoais
              </h3>

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
              <h3 class="font-semibold text-foreground flex items-center gap-2">
                <Phone class="w-4 h-4" />
                Informações de Contato
              </h3>

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
              <h3 class="font-semibold text-foreground flex items-center gap-2">
                <Home class="w-4 h-4" />
                Endereço
              </h3>

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
                class="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
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
