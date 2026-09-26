/**
 * Extrai uma mensagem legível de erros do axios sem vazar detalhes técnicos
 * para a interface.
 */
export function extractApiError(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: unknown } })?.response;
  const data = response?.data;

  if (typeof data === "string" && data.trim()) return data;

  if (data && typeof data === "object") {
    const { message, error: apiError } = data as {
      message?: unknown;
      error?: unknown;
    };

    if (typeof message === "string" && message.trim()) return message;
    if (typeof apiError === "string" && apiError.trim()) return apiError;
  }

  return fallback;
}
