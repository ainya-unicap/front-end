import { Text, View } from "react-native";

type ProfileHeaderProps = {
  name: string;
  email: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";

  return (first + last).toUpperCase();
}

export function ProfileHeader({ name, email }: ProfileHeaderProps) {
  return (
    <View className="items-center rounded-b-3xl bg-emerald-900 px-6 pb-8 pt-14">
      <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-emerald-600">
        <Text className="text-2xl font-bold text-white">
          {getInitials(name)}
        </Text>
      </View>

      <Text className="text-xl font-bold text-white">{name}</Text>
      <Text className="mt-1 text-sm text-emerald-100">{email}</Text>
    </View>
  );
}
