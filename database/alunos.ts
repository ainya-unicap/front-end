import { getUserId } from "./auth";
import { api } from "./index";
import { getApiCache, isNetworkLikeError, setApiCache } from "./offlineCache";
import { type FormularioResumo } from "@/services/api";

export type AlunoHome = {
    formularios_recentes: FormularioResumo[];
    canteiros: unknown[];
    total_listas: number;
    total_formularios: number;
    total_semanas: number;
    total_relatorios: number;
};

export async function getAlunoHome(): Promise<AlunoHome> {
    const userId = getUserId();
    if (!userId) {
        throw new Error('Usuário não autenticado para carregar a home.');
    }

    const cacheKey = `aluno:${userId}:home`;
    try {
        const response = await api.get(`alunos/${userId}/home`);
        setApiCache(cacheKey, response.data);
        return response.data;
    } catch (error) {
        if (isNetworkLikeError(error)) {
            const cached = getApiCache<AlunoHome>(cacheKey);
            if (cached != null) return cached;
        }
        console.error('Error fetching aluno home:', error);
        throw error;
    }
}
