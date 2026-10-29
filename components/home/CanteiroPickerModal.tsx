import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export type CanteiroOption = {
  id: string;
  name: string;
  plantName: string;
  icon: string;
  // Lista de formulários do canteiro (necessária para criar registros)
  listId: string | null;
};

type CanteiroPickerModalProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  canteiros: CanteiroOption[];
  loading?: boolean;
  // Exige que o canteiro tenha lista de formulários (caso do registro)
  requireList?: boolean;
  onClose: () => void;
  onSelect: (canteiro: CanteiroOption) => void;
  onCreateCanteiro: () => void;
};

// Popup para escolher a qual canteiro uma ação (registro, relatório) se refere
export function CanteiroPickerModal({
  visible,
  title,
  subtitle,
  canteiros,
  loading = false,
  requireList = false,
  onClose,
  onSelect,
  onCreateCanteiro,
}: CanteiroPickerModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        {/* O toque dentro do painel não fecha o popup */}
        <Pressable
          onPress={() => {}}
          className="max-h-[70%] rounded-t-3xl bg-white p-6 shadow-xl"
        >
          <View className="mb-1 flex-row items-center justify-between">
            <Text
              accessibilityRole="header"
              className="flex-1 text-xl font-bold text-slate-900"
            >
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              className="p-2"
            >
              <Text className="font-bold text-[#124B33]">Fechar</Text>
            </Pressable>
          </View>

          {subtitle ? (
            <Text className="mb-4 text-sm text-slate-400">{subtitle}</Text>
          ) : null}

          {loading ? (
            <ActivityIndicator color="#065f46" className="my-8" />
          ) : canteiros.length === 0 ? (
            <View className="items-center py-6">
              <Text className="mb-1 text-center text-base font-bold text-slate-800">
                Nenhum canteiro cadastrado
              </Text>
              <Text className="mb-5 text-center text-sm text-slate-400">
                Crie um canteiro para continuar.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={onCreateCanteiro}
                className="h-12 items-center justify-center rounded-2xl bg-emerald-800 px-6 active:opacity-80"
              >
                <Text className="text-base font-bold text-white">
                  Criar canteiro
                </Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {canteiros.map((canteiro) => {
                const disabled = requireList && !canteiro.listId;

                return (
                  <Pressable
                    key={canteiro.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${canteiro.name}, ${canteiro.plantName}`}
                    disabled={disabled}
                    onPress={() => onSelect(canteiro)}
                    className={`flex-row items-center border-b border-slate-100 py-4 ${
                      disabled ? "opacity-40" : "active:bg-emerald-50"
                    }`}
                  >
                    <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                      <Text className="text-xl">{canteiro.icon}</Text>
                    </View>

                    <View className="flex-1">
                      <Text
                        className="text-base font-bold text-slate-900"
                        numberOfLines={1}
                      >
                        {canteiro.name}
                      </Text>
                      <Text className="mt-0.5 text-sm text-slate-400" numberOfLines={1}>
                        {disabled
                          ? "Sem lista de formulários"
                          : canteiro.plantName}
                      </Text>
                    </View>

                    <Text className="text-xl text-slate-300">›</Text>
                  </Pressable>
                );
              })}
              <View className="h-6" />
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
