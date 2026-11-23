import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message || String(error);
  }
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[AppErrorBoundary] Erro capturado:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { error, errorInfo } = this.state;
    const reason = getErrorMessage(error);
    const stack = error?.stack ? String(error.stack) : "";
    const componentStack = errorInfo?.componentStack ? String(errorInfo.componentStack) : "";

    return (
      <SafeAreaView className="flex-1 bg-red-50">
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingVertical: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator
        >
          <View className="mb-4 rounded-2xl border border-red-200 bg-white p-5">
            <Text className="text-xl font-bold text-red-800">Ocorreu um erro no aplicativo</Text>
            <Text className="mt-2 text-sm leading-6 text-red-700">
              O app encontrou um problema inesperado. Abaixo está o motivo para ajudar na correção.
            </Text>
          </View>

          <View className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-800">Motivo do erro</Text>
            <Text selectable className="text-sm leading-6 text-amber-900">
              {reason || "Motivo não identificado."}
            </Text>
          </View>

          {stack ? (
            <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
              <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600">Detalhes técnicos</Text>
              <Text selectable className="font-mono text-xs leading-5 text-slate-700">
                {stack}
              </Text>
            </View>
          ) : null}

          {componentStack ? (
            <View className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
              <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600">Componente</Text>
              <Text selectable className="font-mono text-xs leading-5 text-slate-700">
                {componentStack.trim()}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={this.handleReset}
            className="h-14 items-center justify-center rounded-2xl bg-red-700 active:opacity-80"
          >
            <Text className="text-base font-bold text-white">Tentar novamente</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
