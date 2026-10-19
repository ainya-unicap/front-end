import { Building2, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Text, View, Pressable, ScrollView, Modal } from "react-native";

export type InstitutionItem = {
  label: string;
  value: string;
};

type InstitutionSelectProps = {
  items: InstitutionItem[];
  value: string | null;
  onChange: (value: string | null) => void;
  loading?: boolean;
  error?: string;
};

export function InstitutionSelect({
  items,
  value,
  onChange,
  loading = false,
  error,
}: InstitutionSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // Encontra o nome da instituição que está selecionada
  const selectedItem = items.find((item) => item.value === value);
  
  const displayValue = loading
    ? "Carregando instituições..."
    : selectedItem
    ? selectedItem.label
    : "Selecione a instituição";

  return (
    <View className="mb-4">
      {/* O texto "INSTITUIÇÃO" idêntico ao do Figma */}
      <Text className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-800">
        Instituição
      </Text>

      {/* Nossa caixa desenhada do zero, respeitando os arredondamentos e o tamanho de 56px (h-14) */}
      <Pressable
        onPress={() => !loading && setModalVisible(true)}
        className={`h-14 flex-row items-center rounded-2xl border px-4 ${
          error ? "border-red-500 bg-white" : "border-slate-200 bg-slate-50"
        }`}
      >
        {/* Ícone fixo à esquerda, sem z-index problemático */}
        <Building2 size={20} color={error ? "#ef4444" : "#64748b"} />

        {/* O texto com espaço e tamanho corretos */}
        <Text
          className={`ml-3 flex-1 text-base font-semibold ${
            selectedItem ? "text-slate-900" : "text-slate-400"
          }`}
          numberOfLines={1}
        >
          {displayValue}
        </Text>

        {/* A setinha para baixo do lado direito, igual ao Figma */}
        <ChevronDown size={20} color="#94a3b8" />
      </Pressable>

      {/* A mensagem de erro em vermelho se for preciso */}
      {error ? (
        <Text className="mt-2 text-xs font-semibold text-red-600">
          {error}
        </Text>
      ) : null}

      {/* O menu flutuante que sobe quando a pessoa clica para escolher a escola */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          className="flex-1 justify-end bg-black/40" 
          onPress={() => setModalVisible(false)}
        >
          <View className="max-h-[70%] rounded-t-3xl bg-white p-6 shadow-xl">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-slate-900">
                Selecione sua instituição
              </Text>
              <Pressable onPress={() => setModalVisible(false)} className="p-2">
                <Text className="font-bold text-[#124B33]">Fechar</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {items.map((item) => (
                <Pressable
                  key={item.value}
                  className={`border-b border-slate-100 py-4 ${
                    value === item.value ? "bg-emerald-50 rounded-lg px-2" : ""
                  }`}
                  onPress={() => {
                    onChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    className={`text-base ${
                      value === item.value
                        ? "font-bold text-[#124B33]"
                        : "font-semibold text-slate-700"
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
              <View className="h-10" />
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}