import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Check, ChevronDown } from "lucide-react-native";

import type { MinhaTurma } from "@/database/turmas";

type TurmaSelectProps = {
  turmas: MinhaTurma[];
  value: string | null;
  onChange: (id: string) => void;
  // Sem turma (ou desmarcado): fica apagado e não abre
  disabled?: boolean;
  placeholder?: string;
};

// Lista suspensa simples com as turmas do aluno (são poucas, não precisa de busca)
export function TurmaSelect({
  turmas,
  value,
  onChange,
  disabled = false,
  placeholder = "Selecione a turma",
}: TurmaSelectProps) {
  const [open, setOpen] = useState(false);
  const selecionada = turmas.find((turma) => turma.id === value);

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Escolher turma"
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen((atual) => !atual)}
        className={`flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 ${
          disabled ? "opacity-50" : "active:opacity-80"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`flex-1 text-base ${selecionada ? "text-slate-700" : "text-slate-400"}`}
        >
          {selecionada?.name ?? placeholder}
        </Text>
        <ChevronDown size={20} color="#64748b" />
      </Pressable>

      {open && !disabled ? (
        <View
          key="opcoes"
          className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          {turmas.map((turma, indice) => (
            <Pressable
              key={turma.id}
              accessibilityRole="button"
              onPress={() => {
                onChange(turma.id);
                setOpen(false);
              }}
              className={`flex-row items-center px-4 py-3 active:bg-slate-50 ${
                indice > 0 ? "border-t border-slate-100" : ""
              }`}
            >
              <Text className="flex-1 text-base text-slate-700">{turma.name}</Text>
              {turma.id === value ? <Check size={18} color="#047857" /> : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
