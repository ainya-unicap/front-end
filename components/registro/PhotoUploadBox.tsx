import * as ImagePicker from "expo-image-picker";
import { Alert, Image, Pressable, Text, View } from "react-native";

export type SelectedPhoto = {
  base64: string;
  uri: string;
  mimeType: string;
  fileName: string;
};

type PhotoUploadBoxProps = {
  photoBase64?: string | null;
  onPhotoSelected: (photo: SelectedPhoto | null) => void;
};

async function pickPhoto(
  mode: "camera" | "library",
  onPhotoSelected: (photo: SelectedPhoto | null) => void
) {
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
          allowsEditing: true,
          quality: 0.8,
          base64: true,
          mediaTypes: ["images"],
        });

  if (result.canceled || !result.assets?.[0]) {
    return;
  }

  const asset = result.assets[0];

  if (!asset.base64) {
    Alert.alert(
      "Foto indisponível",
      "Não foi possível carregar esta imagem no momento. Tente novamente."
    );
    return;
  }

  const mimeType = asset.mimeType ?? "image/jpeg";
  if (!mimeType.match(/^image\/(jpeg|png|webp)$/)) {
    Alert.alert("Formato não aceito", "Escolha uma imagem JPEG, PNG ou WEBP.");
    return;
  }

  if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
    Alert.alert("Imagem muito grande", "A foto deve ter no máximo 5 MB.");
    return;
  }

  onPhotoSelected({
    base64: asset.base64,
    uri: asset.uri,
    mimeType,
    fileName: asset.fileName ?? `registro-foto.${mimeType.split("/")[1]}`,
  });
}

export function PhotoUploadBox({ photoBase64, onPhotoSelected }: PhotoUploadBoxProps) {
  const previewUri = photoBase64 ? `data:image/jpeg;base64,${photoBase64}` : null;

  return (
    <View>
      <Pressable
        onPress={() => pickPhoto("camera", onPhotoSelected)}
        className="h-36 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 active:opacity-80"
      >
        {previewUri ? (
          <Image source={{ uri: previewUri }} className="h-full w-full" resizeMode="cover" />
        ) : (
          <>
            <Text className="text-4xl">📸</Text>

            <Text className="mt-2 text-base font-bold text-emerald-900">
              Tirar foto ou enviar
            </Text>

            <Text className="mt-1 text-center text-sm text-slate-400">
              Data e hora adicionadas automaticamente
            </Text>
          </>
        )}
      </Pressable>

      {previewUri ? (
        <Text className="mt-2 text-center text-sm font-medium text-emerald-700">
          Foto adicionada ao registro
        </Text>
      ) : null}

      <View className="mt-4 flex-row gap-2">
        <Pressable
          onPress={() => pickPhoto("camera", onPhotoSelected)}
          className="h-14 flex-1 items-center justify-center rounded-lg bg-emerald-100 active:opacity-80"
        >
          <Text className="text-xl">📷</Text>
        </Pressable>

        <Pressable
          onPress={() => pickPhoto("library", onPhotoSelected)}
          className="h-14 flex-1 items-center justify-center rounded-lg bg-emerald-100 active:opacity-80"
        >
          <Text className="text-xl">🖼️</Text>
        </Pressable>

        <Pressable
          onPress={() => onPhotoSelected(null)}
          className="h-14 flex-1 items-center justify-center rounded-lg bg-slate-200 active:opacity-80"
        >
          <Text className="text-xl">✕</Text>
        </Pressable>
      </View>
    </View>
  );
}