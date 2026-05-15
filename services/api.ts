const API_BASE_URL =
  "https://stunning-space-train-qj9w7x64v5wc669v-3000.app.github.dev/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json?.error || json?.message || "Erro na requisição");
  }

  return json;
}

export type ApiResponse<T> = {
  data: T;
  error: string | null;
  message: string;
};

export type AlunoResumo = {
  total_formularios: number;
  total_semanas: number;
  total_relatorios: number;
};

export type FormularioResumo = {
  id: string;
  type: string;
  synced: boolean;
  createdAt: string;
  started_at?: string;
  ended_at?: string;
  observations?: string;
  list?: {
    id: string;
    plant?: {
      id: string;
      name: string;
      category?: string;
    };
  };
};

export type CanteiroResumo = {
  id: string;
  name: string;
  plant_id: string;
  user_id: string;
  plant?: {
    id: string;
    name: string;
    category?: string;
  };
  listaDeFormularios?: {
    id: string;
    name?: string | null;
    plant?: {
      id: string;
      name: string;
    };
    _count?: {
      formularios: number;
    };
  }[];
};

export async function getAlunoResumo(userId: string) {
  return request<ApiResponse<AlunoResumo>>(`/aluno/${userId}/resumo`);
}

export async function getFormulariosByUser(userId: string) {
  return request<ApiResponse<FormularioResumo[]>>(
    `/formularios?user_id=${userId}`
  );
}

export async function getCanteirosByUser(userId: string) {
  return request<ApiResponse<CanteiroResumo[]>>(
    `/canteiros?user_id=${userId}`
  );
}

// Adicionar funções para criar canteiros, listar plantas, etc. //
export type PlantTemplate = {
  id: string;
  plant_id: string;
  field_name: string;
  unit: string;
};

export type CreateFormularioPayload = {
  list_id: string;
  user_id: string;
  type: "SEMANAL" | "DIARIO";
  observations?: string;
};

export type MeasurementPayload = {
  template_id: string;
  value?: number;
};

export async function getPlantTemplates(plantId: string) {
  return request<ApiResponse<PlantTemplate[]>>(
    `/plant-templates?plant_id=${plantId}`
  );
}

export async function createFormulario(payload: CreateFormularioPayload) {
  return request<ApiResponse<FormularioResumo>>("/formularios", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createChecklist(
  formularioId: string,
  templateIds: string[]
) {
  return request<ApiResponse<{ count: number }>>(
    `/formularios/${formularioId}/checklist`,
    {
      method: "POST",
      body: JSON.stringify({
        template_ids: templateIds,
      }),
    }
  );
}

export async function createMeasurements(
  formularioId: string,
  measurements: MeasurementPayload[]
) {
  return request<ApiResponse<{ count: number }>>(
    `/formularios/${formularioId}/measurements`,
    {
      method: "POST",
      body: JSON.stringify({
        measurements,
      }),
    }
  );
}

export async function finalizarFormulario(formularioId: string) {
  return request<ApiResponse<FormularioResumo>>(
    `/formularios/${formularioId}/finalizar`,
    {
      method: "PATCH",
    }
  );
}

export type FormularioCompleto = FormularioResumo & {
  observations: string;
  checklists?: {
    id: string;
    checked: boolean;
    template?: {
      id: string;
      field_name: string;
      unit: string;
    };
  }[];
  measurements?: {
    id: string;
    value: number;
    template?: {
      id: string;
      field_name: string;
      unit: string;
    };
  }[];
  photos?: {
    id: string;
    url: string;
    takenAt: string;
  }[];
};

export async function getFormularioById(formularioId: string) {
  return request<ApiResponse<FormularioCompleto>>(`/formularios/${formularioId}`);
}

export async function updateFormulario(
  formularioId: string,
  payload: Partial<FormularioCompleto>
) {
  return request<ApiResponse<FormularioCompleto>>(`/formularios/${formularioId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function syncFormulario(formularioId: string, payload: unknown) {
  return request<ApiResponse<FormularioCompleto>>(
    `/formularios/${formularioId}/sync`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function deletePhoto(photoId: string) {
  return request<ApiResponse<{ id: string }>>(`/photos/${photoId}`, {
    method: "DELETE",
  });
}