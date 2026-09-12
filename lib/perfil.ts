/**
 * Perfil acadêmico devolvido pelo backend após a autenticação.
 *
 * O front nunca deduz o perfil a partir da matrícula: ele apenas interpreta e
 * exibe o que a API informar.
 */

export type PerfilAcademico = "aluno" | "professor";

export const PERFIL_LABEL: Record<PerfilAcademico, string> = {
  aluno: "Aluno",
  professor: "Professor",
};

/** Converte um valor vindo da API em um perfil conhecido, ou null. */
export function parsePerfil(value: unknown): PerfilAcademico | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();

  if (normalized === "aluno" || normalized === "student") return "aluno";
  if (normalized === "professor" || normalized === "teacher") return "professor";

  return null;
}

export function perfilLabel(perfil: PerfilAcademico | null): string | null {
  return perfil ? PERFIL_LABEL[perfil] : null;
}
