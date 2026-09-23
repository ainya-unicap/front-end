import { GraduationCap, Presentation } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { PERFIL_LABEL, PerfilAcademico } from "@/lib/perfil";

type RoleSelectorProps = {
  value: PerfilAcademico;
  onChange: (role: PerfilAcademico) => void;
};

const OPTIONS: {
  role: PerfilAcademico;
  Icon: typeof GraduationCap;
}[] = [
  { role: "aluno", Icon: GraduationCap },
  { role: "professor", Icon: Presentation },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Você é
      </Text>

      <View className="flex-row gap-3">
        {OPTIONS.map(({ role, Icon }) => {
          const selected = value === role;

          return (
            <Pressable
              key={role}
              onPress={() => onChange(role)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={PERFIL_LABEL[role]}
              className={`flex-1 flex-row items-center rounded-2xl border px-4 py-3 active:opacity-80 ${
                selected
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <View
                className={`mr-3 h-9 w-9 items-center justify-center rounded-xl ${
                  selected ? "bg-emerald-100" : "bg-slate-100"
                }`}
              >
                <Icon size={19} color={selected ? "#047857" : "#94a3b8"} />
              </View>

              <Text
                className={`text-sm font-bold ${
                  selected ? "text-emerald-800" : "text-slate-700"
                }`}
              >
                {PERFIL_LABEL[role]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
