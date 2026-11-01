import { Check, ChevronDown, Search, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";

export type PlantItem = {
  id: string;
  name: string;
  icon: AppIconName;
};

type PlantSelectProps = {
  items: PlantItem[];
  value: string | null;
  onChange: (id: string) => void;
  loading?: boolean;
  error?: string;
  // Impede a troca (ex.: canteiro que já tem formulários)
  disabled?: boolean;
  emptyText?: string;
};

// Ignora acentos e maiúsculas na busca ("cacto" encontra "Cáctus")
function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// Lista suspensa com busca para escolher a planta (o catálogo pode passar de 60)
export function PlantSelect({
  items,
  value,
  onChange,
  loading = false,
  error,
  disabled = false,
  emptyText = "Nenhuma planta disponível.",
}: PlantSelectProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = items.find((item) => item.id === value);

  const filtradas = useMemo(() => {
    const termo = normalizar(query);
    if (!termo) return items;
    return items.filter((item) => normalizar(item.name).includes(termo));
  }, [items, query]);

  function fechar() {
    setOpen(false);
    setQuery("");
  }

  function escolher(id: string) {
    onChange(id);
    fechar();
  }

  let textoCampo = "Selecione a planta";
  if (loading) textoCampo = "Carregando plantas...";
  else if (error) textoCampo = error;
  else if (items.length === 0) textoCampo = emptyText;
  else if (selected) textoCampo = selected.name;

  const indisponivel = loading || !!error || items.length === 0;

  return (
    <View className="mb-6">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Planta: ${textoCampo}`}
        accessibilityHint="Abre a lista de plantas com busca"
        accessibilityState={{ disabled: disabled || indisponivel }}
        disabled={disabled || indisponivel}
        onPress={() => setOpen(true)}
        className={`h-14 flex-row items-center rounded-2xl border px-4 ${
          error ? "border-red-500 bg-white" : "border-slate-200 bg-white"
        } ${disabled ? "opacity-60" : ""}`}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#065f46" />
        ) : selected ? (
          <AppIcon name={selected.icon} size={22} color="#047857" />
        ) : null}

        <Text
          className={`flex-1 text-base font-semibold ${
            loading || selected ? "ml-3" : ""
          } ${selected ? "text-slate-900" : error ? "text-red-600" : "text-slate-400"}`}
          numberOfLines={1}
        >
          {textoCampo}
        </Text>

        {disabled || indisponivel ? null : <ChevronDown size={20} color="#94a3b8" />}
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={fechar}>
        <View className="flex-1 justify-end bg-black/40">
          {/* Toque fora do painel fecha */}
          <Pressable className="flex-1" onPress={fechar} accessibilityLabel="Fechar" />

          <View
            className="rounded-t-3xl bg-white px-6 pt-6 shadow-xl"
            style={{ height: height * 0.7, paddingBottom: insets.bottom + 16 }}
          >
            <View className="mb-3 flex-row items-center justify-between">
              <Text accessibilityRole="header" className="text-xl font-bold text-slate-900">
                Escolha a planta
              </Text>
              <Pressable accessibilityRole="button" onPress={fechar} className="p-2">
                <Text className="font-bold text-[#124B33]">Fechar</Text>
              </Pressable>
            </View>

            {/* Barra de pesquisa */}
            <View className="mb-2 h-12 flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-3">
              <Search size={18} color="#94a3b8" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Pesquisar planta"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                accessibilityLabel="Pesquisar planta"
                className="ml-2 flex-1 text-base text-slate-900"
              />
              {query ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Limpar pesquisa"
                  onPress={() => setQuery("")}
                  hitSlop={10}
                >
                  <X size={18} color="#94a3b8" />
                </Pressable>
              ) : null}
            </View>

            <Text className="mb-2 text-xs font-semibold text-slate-400">
              {filtradas.length} {filtradas.length === 1 ? "planta" : "plantas"}
              {query ? ` para "${query.trim()}"` : ""}
            </Text>

            <FlatList
              data={filtradas}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              initialNumToRender={20}
              ListEmptyComponent={
                <Text className="py-8 text-center text-sm text-slate-400">
                  Nenhuma planta encontrada.
                </Text>
              }
              renderItem={({ item }) => {
                const ativo = item.id === value;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: ativo }}
                    onPress={() => escolher(item.id)}
                    className={`flex-row items-center border-b border-slate-100 px-2 py-3 ${
                      ativo ? "rounded-lg bg-emerald-50" : "active:bg-slate-50"
                    }`}
                  >
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                      <AppIcon name={item.icon} size={22} color="#047857" />
                    </View>

                    <Text
                      className={`flex-1 text-base ${
                        ativo ? "font-bold text-[#124B33]" : "font-semibold text-slate-700"
                      }`}
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>

                    {ativo ? <Check size={20} color="#047857" /> : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
