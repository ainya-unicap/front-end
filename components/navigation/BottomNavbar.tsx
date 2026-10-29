import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";

type BottomNavbarProps = {
  active?: "home" | "canteiro" | "relatorio" | "perfil";
};

function NavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: AppIconName;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center py-2 active:opacity-80"
    >
      <AppIcon name={icon} size={22} color={active ? "#166534" : "#94a3b8"} />

      <Text
        className={`mt-1 text-[11px] font-bold ${
          active ? "text-emerald-800" : "text-slate-400"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function BottomNavbar({ active = "home" }: BottomNavbarProps) {
  return (
    <View className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-4 pb-6 pt-2 shadow-lg">
      <View className="flex-row items-center">
        <NavItem
          icon="house"
          label="Início"
          active={active === "home"}
          onPress={() => router.replace("/")}
        />

        <NavItem
          icon="plant"
          label="Canteiro"
          active={active === "canteiro"}
        />

        <NavItem
          icon="file"
          label="Relatório"
          active={active === "relatorio"}
        />

        <NavItem
          icon="user"
          label="Perfil"
          active={active === "perfil"}
        />
      </View>
    </View>
  );
}