import * as ImagePicker from "expo-image-picker";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { AppIcon } from "@/components/ui/AppIcon";

export type SelectedPhoto = {
  base64: string;
  uri: string;
  mimeType: string;
  fileName: string;
};

export const MIN_REGISTRO_PHOTOS = 5;
export const MAX_REGISTRO_PHOTOS = 10;

type PhotoUploadBoxProps = {
  photos: SelectedPhoto[];
  onPhotosChange: (photos: SelectedPhoto[]) => void;
};

async function pickPhoto(
  mode: "camera" | "library",
  remainingSlots: number,
  onPhotosSelected: (photos: SelectedPhoto[]) => void
) {
  if (remainingSlots <= 0) {
    Alert.alert("Limite de fotos", `Cada registro aceita no máximo ${MAX_REGISTRO_PHOTOS} fotos.`);
    return;
  }

  const permissionResult =
    mode === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    Alert.alert(
      "Permissão necessária",
      mode === "camera"
        ? "Necessário permitir o uso da câmera para tirar uma foto."
        : "Necessário permitir acesso à galeria para escolher uma imagem."
    );
    return;
  }

  const result =
    mode === "camera"
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.8,
          base64: true,
          mediaTypes: ["images"],
        })
      : await ImagePicker.launchImageLibraryAsync({
          allowsMultipleSelection: true,
          selectionLimit: remainingSlots,
          quality: 0.8,
          base64: true,
          mediaTypes: ["images"],
        });

  if (result.canceled || !result.assets?.length) {
    return;
  }

  const selectedPhotos: SelectedPhoto[] = [];
  let unavailableCount = 0;
  let unsupportedCount = 0;
  let oversizedCount = 0;

  for (const asset of result.assets.slice(0, remainingSlots)) {
    if (!asset.base64) {
      unavailableCount += 1;
      continue;
    }

    const mimeType = asset.mimeType ?? "image/jpeg";
    if (!mimeType.match(/^image\/(jpeg|png|webp)$/)) {
      unsupportedCount += 1;
      continue;
    }

    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      oversizedCount += 1;
      continue;
    }

    selectedPhotos.push({
      base64: asset.base64,
      uri: asset.uri,
      mimeType,
      fileName:
        asset.fileName ??
        `registro-foto-${Date.now()}-${selectedPhotos.length}.${mimeType.split("/")[1]}`,
    });
  }

  if (selectedPhotos.length > 0) {
    onPhotosSelected(selectedPhotos);
  }

  const rejectedCount = unavailableCount + unsupportedCount + oversizedCount;
  if (rejectedCount > 0) {
    const reasons = [
      unavailableCount > 0 ? `${unavailableCount} indisponível(is)` : null,
      unsupportedCount > 0 ? `${unsupportedCount} com formato não aceito` : null,
      oversizedCount > 0 ? `${oversizedCount} acima de 5 MB` : null,
    ].filter(Boolean);
    Alert.alert(
      "Algumas fotos não foram adicionadas",
      `Aceitamos imagens JPEG, PNG ou WEBP de até 5 MB. ${reasons.join(", ")}.`
    );
  }
}

export function PhotoUploadBox({ photos, onPhotosChange }: PhotoUploadBoxProps) {
  const remainingSlots = MAX_REGISTRO_PHOTOS - photos.length;
  const isAtLimit = remainingSlots <= 0;

  return (
    <View>
      <Text className="mb-3 text-center text-sm font-medium text-slate-600">
        {photos.length} de {MAX_REGISTRO_PHOTOS} fotos · mínimo de {MIN_REGISTRO_PHOTOS}
      </Text>

      {photos.length > 0 ? (
        <View className="mb-3 flex-row flex-wrap gap-3">
          {photos.map((photo, index) => (
            <View key={`${photo.uri}-${index}`} className="relative">
              <Image
                source={{ uri: photo.uri }}
                className="h-20 w-20 rounded-xl bg-emerald-100"
                resizeMode="cover"
              />
              <Pressable
                accessibilityLabel={`Remover foto ${index + 1}`}
                onPress={() => onPhotosChange(photos.filter((_, photoIndex) => photoIndex !== index))}
                className="absolute -right-2 -top-2 h-7 w-7 items-center justify-center rounded-full bg-slate-800"
              >
                <Text className="text-sm font-bold text-white">×</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <Text className="mb-3 text-center text-sm text-slate-400">
        Escolha de {MIN_REGISTRO_PHOTOS} a {MAX_REGISTRO_PHOTOS} fotos. A data e hora são adicionadas automaticamente.
      </Text>

      {isAtLimit ? (
        <Text className="mb-3 text-center text-sm font-medium text-amber-700">
          Limite de {MAX_REGISTRO_PHOTOS} fotos atingido.
        </Text>
      ) : null}

      <View className="mt-4 flex-row gap-2">
        <Pressable
          onPress={() => pickPhoto("camera", remainingSlots, (selected) => onPhotosChange([...photos, ...selected]))}
          disabled={isAtLimit}
          className="h-14 flex-1 items-center justify-center rounded-lg bg-emerald-100 active:opacity-80 disabled:opacity-50"
        >
          <View className="flex-row items-center gap-2">
            <AppIcon name="camera" size={18} />
            <Text className="text-sm font-bold text-emerald-900">Tirar foto</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => pickPhoto("library", remainingSlots, (selected) => onPhotosChange([...photos, ...selected]))}
          disabled={isAtLimit}
          className="h-14 flex-1 items-center justify-center rounded-lg bg-emerald-100 active:opacity-80 disabled:opacity-50"
        >
          <View className="flex-row items-center gap-2">
            <AppIcon name="image" size={18} />
            <Text className="text-sm font-bold text-emerald-900">Enviar da galeria</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}