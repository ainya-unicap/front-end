import { Image, Text, View } from "react-native";

type PhotoPreview = {
  id: string;
  url: string;
  takenAt?: string;
};

type PhotoPreviewListProps = {
  photos: PhotoPreview[];
};

function formatTime(dateString?: string) {
  if (!dateString) return "--:--";

  const date = new Date(dateString);

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PhotoPreviewList({ photos }: PhotoPreviewListProps) {
  if (photos.length === 0) {
    return (
      <Text className="text-sm text-slate-400">
        Nenhuma foto registrada ainda.
      </Text>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-3">
      {photos.map((photo) => (
        <View key={photo.id} className="overflow-hidden rounded-xl">
          {photo.url.startsWith("/uploads/") ? (
            <View className="h-16 w-16 items-center justify-center bg-emerald-100">
              <Text className="text-2xl">🌱</Text>
            </View>
          ) : (
            <Image
              source={{ uri: photo.url }}
              className="h-16 w-16 bg-emerald-100"
            />
          )}

          <View className="items-center bg-slate-700 px-1 py-1">
            <Text className="text-[10px] font-bold text-white">
              {formatTime(photo.takenAt)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}