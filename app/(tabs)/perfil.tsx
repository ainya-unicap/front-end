import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import useSWR from "swr";

import { ProfileHeader } from "@/components/perfil/ProfileHeader";
import { ProfileSection } from "@/components/perfil/ProfileSection";
import { ProfileRow } from "@/components/perfil/ProfileRow";
import { Skeleton } from "@/components/ui/Skeleton";
import { getProfile } from "@/database/user";
import { logout } from "@/database/auth";

export default function PerfilScreen() {
  const { data: perfilResp, isLoading } = useSWR("perfil", () => getProfile());
  // A API pode devolver o objeto direto ou embrulhado em { data: {...} }
  const perfil = (perfilResp as any)?.data ?? perfilResp;

  async function handleLogout() {
    // Encerra a sessão no back-end e limpa os tokens locais antes de redirecionar.
    await logout();
    router.replace("/login");
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50">
        {/* Skeleton do cabeçalho */}
        <View className="items-center gap-3 rounded-b-3xl bg-emerald-900 px-6 pb-8 pt-16">
          <Skeleton width={80} height={80} radius={40} />
          <Skeleton width={160} height={20} />
          <Skeleton width={200} height={14} />
        </View>

        {/* Skeleton das seções */}
        <View className="gap-4 px-5 pt-6">
          {[0, 1, 2].map((section) => (
            <View key={section} className="gap-3 rounded-2xl bg-white p-4">
              {[0, 1].map((row) => (
                <View key={row} className="flex-row items-center gap-3">
                  <Skeleton width={40} height={40} radius={12} />
                  <View className="flex-1 gap-2">
                    <Skeleton width="40%" height={12} />
                    <Skeleton width="70%" height={16} />
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
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
              value={perfil?.institution?.name ?? "Sem instituição vinculada"}
            />
            <ProfileRow
              icon="📅"
              iconBg="bg-orange-100"
              label="Período letivo"
              value={perfil?.academic_period?.name ?? "Sem período vinculado"}
            />
            <ProfileRow
              icon="👥"
              iconBg="bg-violet-100"
              label="Turma"
              value={perfil?.turma?.name ?? "Sem turma vinculada"}
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
