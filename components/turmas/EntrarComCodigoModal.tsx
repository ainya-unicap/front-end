import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyRound } from "lucide-react-native";
import { mutate } from "swr";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { entrarNaTurma } from "@/database/turmas";
import { extractApiError, extractApiErrorCode } from "@/lib/apiError";

type EntrarComCodigoModalProps = {
  visible: boolean;
  onClose: () => void;
  // Chamado com o nome da turma quando o aluno entra
  onJoined: (turmaNome: string) => void;
};

const ERROS: Record<string, string> = {
  CODIGO_INVALIDO: "Código inválido. Confira com a sua professora.",
  JA_VINCULADO: "Você já está nesta turma.",
};

// Popup para o aluno entrar numa turma com o código passado pela professora
export function EntrarComCodigoModal({
  visible,
  onClose,
  onJoined,
}: EntrarComCodigoModalProps) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState("");
  const [erro, setErro] = useState<string | undefined>();
  const [enviando, setEnviando] = useState(false);

  function fechar() {
    if (enviando) return;
    setCode("");
    setErro(undefined);
    onClose();
  }

  async function handleEntrar() {
    if (enviando) return;

    const codigo = code.trim().toUpperCase();
    if (!codigo) {
      setErro("Digite o código da turma.");
      return;
    }

    try {
      setEnviando(true);
      setErro(undefined);

      const turma = await entrarNaTurma(codigo);

      // Atualiza a lista de turmas e o perfil (que mostra a turma mais recente)
      await Promise.all([mutate("minhas-turmas"), mutate("perfil")]);

      setCode("");
      onJoined(turma?.name ?? "a turma");
    } catch (error) {
      const codigoErro = extractApiErrorCode(error);
      setErro(
        (codigoErro && ERROS[codigoErro]) ??
          extractApiError(error, "Não foi possível entrar na turma agora.")
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={fechar}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/40"
      >
        {/* Toque fora do painel fecha */}
        <Pressable className="flex-1" onPress={fechar} accessibilityLabel="Fechar" />

        <View
          className="rounded-t-3xl bg-white px-6 pt-6 shadow-xl"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          <View className="mb-1 flex-row items-center justify-between">
            <Text accessibilityRole="header" className="text-xl font-bold text-slate-900">
              Entrar em uma turma
            </Text>
            <Pressable accessibilityRole="button" onPress={fechar} className="p-2">
              <Text className="font-bold text-[#124B33]">Fechar</Text>
            </Pressable>
          </View>

          <Text className="mb-4 text-sm leading-5 text-slate-400">
            Digite o código que a sua professora passou. Você só precisa fazer isso uma vez
            por turma.
          </Text>

          <TextField
            label="Código da turma"
            value={code}
            onChangeText={(texto) => {
              setCode(texto.toUpperCase());
              setErro(undefined);
            }}
            placeholder="Ex.: A3F9K2"
            autoCapitalize="characters"
            autoCorrect={false}
            autoComplete="off"
            maxLength={16}
            returnKeyType="done"
            onSubmitEditing={handleEntrar}
            icon={<KeyRound size={20} color={erro ? "#ef4444" : "#64748b"} />}
            tone={erro ? "error" : "neutral"}
            helper={erro}
          />

          <Button label="Entrar na turma" onPress={handleEntrar} loading={enviando} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
