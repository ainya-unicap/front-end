import { Alert } from "react-native";

let installed = false;

function formatReason(error: unknown): string {
  if (error instanceof Error) {
    const name = error.name ? `${error.name}: ` : "";
    return `${name}${error.message || String(error)}`.trim();
  }
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function installGlobalErrorHandling() {
  if (installed) return;
  installed = true;

  const defaultHandler =
    typeof (globalThis as any).ErrorUtils?.getGlobalHandler === "function"
      ? (globalThis as any).ErrorUtils.getGlobalHandler()
      : undefined;

  try {
    (globalThis as any).ErrorUtils?.setGlobalHandler?.((error: unknown, isFatal?: boolean) => {
      const reason = formatReason(error);
      console.error("[GlobalErrorHandler]", { isFatal, error });

      try {
        Alert.alert(
          isFatal ? "Erro crítico no aplicativo" : "Erro no aplicativo",
          `Motivo do erro:\n${reason}`,
          [{ text: "OK" }]
        );
      } catch {
        // ignore alert failures
      }

      // Preserve default behavior/logging in dev when available, but avoid rethrow loops.
      try {
        if (typeof defaultHandler === "function" && !isFatal) {
          // non-fatal errors can keep default handling in dev tooling
          // defaultHandler(error, isFatal);
        }
      } catch {
        // ignore
      }
    });
  } catch (e) {
    console.error("[GlobalErrorHandler] Falha ao instalar handler global:", e);
  }

  // Best-effort: unhandled promise rejections (runtime-dependent support)
  try {
    const anyGlobal = globalThis as any;
    if (typeof anyGlobal?.addEventListener === "function" && !anyGlobal.__ainayaUnhandledRejectionInstalled) {
      anyGlobal.__ainayaUnhandledRejectionInstalled = true;
      anyGlobal.addEventListener("unhandledrejection", (event: any) => {
        const reason = formatReason(event?.reason ?? event);
        console.error("[UnhandledRejection]", event?.reason ?? event);
        try {
          Alert.alert("Erro no aplicativo", `Motivo do erro:\n${reason}`, [{ text: "OK" }]);
        } catch {
          // ignore
        }
      });
    } else if (typeof anyGlobal?.HermesInternal?.hasPromise === "function") {
      // Hermes environments vary; rely on ErrorUtils/logging when unavailable.
    }
  } catch {
    // ignore
  }
}
