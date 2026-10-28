import { getUserId } from "./auth";
import { api } from "./index";
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
    try {
        const userId = getUserId();
        if (!userId) {
            throw new Error('Usuário não autenticado para carregar a home.');
        }

        const response = await api.get(`alunos/${userId}/home`);
        return response.data;
    } catch (error) {
        console.error('Error fetching aluno home:', error);
        throw error;
    }
}
