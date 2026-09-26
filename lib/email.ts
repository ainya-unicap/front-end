/**
 * Regras de formato da matrícula acadêmica.
 *
 * O cliente valida apenas o formato e a obrigatoriedade: quem identifica se a
 * matrícula pertence a um aluno ou a um professor é o backend, que devolve o
 * perfil junto da resposta de autenticação.
 */

const ALLOWED_CHARS = /[^a-zA-Z0-9@._-]/g;
const FORMAT = /^[a-zA-Z0-9@._-]+$/;

export const EMAIL_MAX_LENGTH = 200;
export const EMAIL_MIN_DIGITS = 5;

export type EmailValidation =
  | { valid: true; value: string }
  | { valid: false; message: string };


export function normalizeEmail(input: string): string {
  return input.replace(ALLOWED_CHARS, "").slice(0, EMAIL_MAX_LENGTH);
}

export function validateEmail(input: string): EmailValidation {
  const value = normalizeEmail(input).trim();

  if (!value) {
    return { valid: false, message: "Informe seu email." };
  }

  if (!FORMAT.test(value)) {
    return {
      valid: false,
      message: "Formato: email@dominio.com",
    };
  }

  return { valid: true, value };
}
