import { ScrollView, Text, View } from "react-native";
import Constants from "expo-constants";

import HeaderStack from "@/components/navigation/headerStack";
import { ProfileSection } from "@/components/perfil/ProfileSection";
import { ProfileRow } from "@/components/perfil/ProfileRow";

export default function SobreScreen() {
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-16"
        showsVerticalScrollIndicator={false}
      >
        <HeaderStack title="Sobre" />

        {/* Identidade do app */}
        <View className="mb-8 items-center">
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-3xl bg-emerald-900">
            <Text className="text-5xl">🌱</Text>
          </View>
          <Text className="text-2xl font-bold text-emerald-900">Forrage App</Text>
          <Text className="mt-1 text-center text-sm text-slate-400">
            Acompanhamento de plantas forrageiras
          </Text>
          <Text className="mt-2 text-xs font-semibold text-slate-400">
            Versão {version}
          </Text>
        </View>

        {/* Descrição */}
        <ProfileSection title="O aplicativo">
          <View className="px-4 py-4">
            <Text className="text-sm leading-6 text-slate-600">
              O Forrage App apoia alunos no cultivo, manejo e caracterização de
              plantas forrageiras ao longo do semestre. Registre medições
              semanais, acompanhe seus canteiros e gere relatórios de análise
              automaticamente.
            </Text>
          </View>
        </ProfileSection>

        {/* Informações */}
        <ProfileSection title="Informações">
          <ProfileRow
            icon="📦"
            iconBg="bg-emerald-100"
            label="Versão"
            value={version}
          />
          <ProfileRow
            icon="🎓"
            iconBg="bg-violet-100"
            label="Projeto acadêmico"
            value="Unicap — PI 4"
          />
          <ProfileRow
            icon="🌿"
            iconBg="bg-amber-100"
            label="Categoria"
            value="Educação / Agronomia"
            isLast
          />
        </ProfileSection>

        {/* Créditos */}
        <ProfileSection title="Créditos">
          <View className="px-4 py-4">
            <Text className="text-sm leading-6 text-slate-600">
              Desenvolvido como Projeto Interdisciplinar da Universidade Católica
              de Pernambuco (Unicap).
            </Text>
          </View>
        </ProfileSection>

        <Text className="mt-2 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Forrage App
        </Text>
      </ScrollView>
    </View>
  );
}
