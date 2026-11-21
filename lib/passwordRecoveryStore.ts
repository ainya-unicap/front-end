import { create } from "zustand";

/**
 * Estado do fluxo "Esqueci minha senha", mantido só em memória: o e-mail e o
 * token de redefinição nunca vão para a URL nem para o armazenamento do
 * aparelho. Se o app for fechado no meio do fluxo, ele recomeça na tela 1.
 */
type PasswordRecoveryState = {
  email: string;
  resetToken: string;
  setEmail: (email: string) => void;
  setResetToken: (resetToken: string) => void;
  clear: () => void;
};

export const usePasswordRecoveryStore = create<PasswordRecoveryState>((set) => ({
  email: "",
  resetToken: "",
  setEmail: (email) => set({ email, resetToken: "" }),
  setResetToken: (resetToken) => set({ resetToken }),
  clear: () => set({ email: "", resetToken: "" }),
}));
