import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";

import { ProfileHeader } from "@/components/perfil/ProfileHeader";
import { ProfileSection } from "@/components/perfil/ProfileSection";
import { ProfileRow } from "@/components/perfil/ProfileRow";
import useSWR from "swr";
import { getProfile } from "@/database/user";

// ---------------------------------------------------------------------------
// DADOS MOCKADOS — substituir pelos dados reais do BD.
//
// Trocar por um getProfile(userId) em services/api.ts e carregar via useEffect,
// guardando o resultado em estado no lugar de MOCK_PERFIL. Os campos abaixo já
// espelham o que cada linha exibe na tela.
// ---------------------------------------------------------------------------
const MOCK_PERFIL = {
  name: "Luana Cabral",
  email: "luana@ufrpe.edu.br",
  institution: "UFRPE — Zootecnia",
  period: "2026.1",
  turma: "PFP I — Turma A",
  notifications: "Ativadas",
  offlineSync: "Automática",
};

export default function PerfilScreen() {
  const { data: perfil, error: errorPerfil, isLoading: isLoadingPerfil } = useSWR("perfil", () => getProfile());


  if (isLoadingPerfil) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg font-semibold">Carregando perfil...</Text>
      </View>
    );
  }

  function handleLogout() {
    // TODO(BD): limpar sessão/token armazenado antes de redirecionar.
    router.replace("/login");
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader name={perfil?.name} email={perfil?.email} />

        <View className="px-5 pt-5">
          <ProfileSection title="Perfil">
            <ProfileRow
              icon="👤"
              iconBg="bg-violet-100"
              label="Nome completo"
              value={perfil?.name}
            />
            <ProfileRow
              icon="📧"
              iconBg="bg-sky-100"
              label="E-mail"
              value={perfil?.email}
            />
            <ProfileRow
              icon="🔒"
              iconBg="bg-emerald-100"
              label="Senha"
              value="••••••••"
              isLast
            />
          </ProfileSection>

          <ProfileSection title="Vínculos acadêmicos">
            <ProfileRow
              icon="🏛️"
              iconBg="bg-amber-100"
              label="Instituição"
              value={perfil?.institution?.name}
            />
            <ProfileRow
              icon="📅"
              iconBg="bg-orange-100"
              label="Período letivo"
              value={"Sem período vinculado"}
            />
            <ProfileRow
              icon="👥"
              iconBg="bg-violet-100"
              label="Turma"
              value={"Sem turma vinculada"}
              isLast
            />
          </ProfileSection>

          <ProfileSection title="Preferências">
            <ProfileRow
              icon="🔔"
              iconBg="bg-amber-100"
              label="Notificações"
              value={MOCK_PERFIL.notifications}
            />
            <ProfileRow
              icon="📊"
              iconBg="bg-sky-100"
              label="Sincronização offline"
              value={MOCK_PERFIL.offlineSync}
              isLast
            />
          </ProfileSection>

          <Pressable
            onPress={handleLogout}
            className="mt-1 items-center rounded-2xl bg-red-50 py-4 active:opacity-80"
          >
            <Text className="text-base font-bold text-red-500">
              Sair da conta
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
