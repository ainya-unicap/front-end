export function normalizeMatricula(value: string) {
  return value.replace(/\D/g, ""); 
}

export function validateMatricula(value: string) {
  const matricula = normalizeMatricula(value);
  
  if (!matricula) {
    return { valid: false, message: "Informe sua matrícula.", value: "" };
  }
  
  if (matricula.length < 4) {
    return { valid: false, message: "A matrícula é muito curta.", value: matricula };
  }
  
  return { valid: true, message: "", value: matricula };
}