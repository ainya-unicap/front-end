/**
 * Regras de formato da matrícula acadêmica.
 *
 * O cliente valida apenas o formato e a obrigatoriedade: quem identifica se a
 * matrícula pertence a um aluno ou a um professor é o backend, que devolve o
 * perfil junto da resposta de autenticação.
 */

const ALLOWED_CHARS = /[^\d./-]/g;
const FORMAT = /^[\d./-]+$/;

export const MATRICULA_MAX_LENGTH = 20;
export const MATRICULA_MIN_DIGITS = 4;

export type MatriculaValidation =
  | { valid: true; value: string }
  | { valid: false; message: string };

/** Remove caracteres não permitidos e limita o tamanho, preservando a digitação. */
export function normalizeMatricula(input: string): string {
  return input.replace(ALLOWED_CHARS, "").slice(0, MATRICULA_MAX_LENGTH);
}

export function countDigits(input: string): number {
  return input.replace(/\D/g, "").length;
}

export function validateMatricula(input: string): MatriculaValidation {
  const value = normalizeMatricula(input).trim();

  if (!value) {
    return { valid: false, message: "Informe sua matrícula." };
  }

  if (!FORMAT.test(value)) {
    return {
      valid: false,
      message: "Use apenas números, ponto, hífen ou barra.",
    };
  }

  if (countDigits(value) < MATRICULA_MIN_DIGITS) {
    return {
      valid: false,
      message: `A matrícula precisa ter ao menos ${MATRICULA_MIN_DIGITS} dígitos.`,
    };
  }

  return { valid: true, value };
}
