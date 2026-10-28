import { api } from "./index";

// Pede o envio do código. A resposta é sempre a mesma, exista ou não o e-mail.
export async function requestPasswordCode(email: string, recaptchaToken: string) {
    const response = await api.post('users/password-recovery/request', { email, recaptchaToken });
    return response.data as { message: string };
}

// Confirma o código de 6 dígitos e devolve o token de uso único para redefinir.
export async function verifyPasswordCode(email: string, code: string) {
    const response = await api.post('users/password-recovery/verify', { email, code });
    return response.data as { resetToken: string };
}

export async function resetPassword(email: string, resetToken: string, password: string) {
    const response = await api.post('users/password-recovery/reset', { email, resetToken, password });
    return response.data as { message: string };
}
