// Tipos das respostas da API usados pelas telas. As chamadas HTTP ficam em database/.

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
