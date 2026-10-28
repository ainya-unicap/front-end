import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { Camera } from "lucide-react-native";

type ProfileHeaderProps = {
  name: string;
  email: string;
  avatarUri?: string | null;
  isUploadingAvatar?: boolean;
  onChangeAvatar?: () => void;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";

  return (first + last).toUpperCase();
}

export function ProfileHeader({
  name,
  email,
  avatarUri,
  isUploadingAvatar = false,
  onChangeAvatar,
}: ProfileHeaderProps) {
  return (
    <View className="items-center rounded-b-3xl bg-emerald-900 px-6 pb-8 pt-14">
      <Pressable
        onPress={onChangeAvatar}
        disabled={!onChangeAvatar || isUploadingAvatar}
        accessibilityRole="button"
        accessibilityLabel="Mudar foto de perfil"
        className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-emerald-600"
      >
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} className="h-20 w-20 rounded-full" />
        ) : (
          <Text className="text-2xl font-bold text-white">
            {getInitials(name)}
          </Text>
        )}
        <View className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full border-2 border-emerald-900 bg-white">
          {isUploadingAvatar ? (
            <ActivityIndicator size="small" color="#047857" />
          ) : (
            <Camera size={14} color="#047857" />
          )}
        </View>
      </Pressable>

      <Text className="text-xl font-bold text-white">{name}</Text>
      <Text className="mt-1 text-sm text-emerald-100">{email}</Text>
    </View>
  );
}
