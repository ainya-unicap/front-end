import * as FileSystem from "expo-file-system/legacy";

import { getAccessToken } from "./auth";
import { api } from "./index";

export async function generateRelatorio(data: { list_id: string }) {
    try {
        const response = await api.post('relatorios/generate', data);
        return response.data;
    } catch (error) {
        console.error('Error generating relatorio:', error);
        throw error;
    }
}

export async function generateRelatorioComAnalise(canteiroId: string) {
    try {
        return await api.post(`canteiros/${canteiroId}/relatorio-ia`);
    } catch (error) {
        console.error('Error generating relatorio com analise:', error);
        throw error;
    }
}

export async function getRelatorioById(id: string) {
    try {
        const response = await api.get(`relatorios/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching relatorio by id:', error);
        throw error;
    }
}

export async function updateRelatorio(id: string, data: {
    introduction?: string;
    objective?: string;
    development?: string;
    final_thoughts?: string;
    references?: string;
}) {
    try {
        const response = await api.put(`relatorios/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating relatorio:', error);
        throw error;
    }
}

export async function updateRelatorioObjective(id: string, objective: string) {
    try {
        const response = await api.put(`relatorios/${id}/objective`, { objective });
        return response.data;
    } catch (error) {
        console.error('Error updating relatorio objective:', error);
        throw error;
    }
}

export async function updateRelatorioIntroduction(id: string, introduction: string) {
    try {
        const response = await api.put(`relatorios/${id}/introduction`, { introduction });
        return response.data;
    } catch (error) {
        console.error('Error updating relatorio introduction:', error);
        throw error;
    }
}

export async function updateRelatorioDevelopment(id: string, development: string) {
    try {
        const response = await api.put(`relatorios/${id}/development`, { development });
        return response.data;
    } catch (error) {
        console.error('Error updating relatorio development:', error);
        throw error;
    }
}

export async function updateRelatorioFinalThoughts(id: string, final_thoughts: string) {
    try {
        const response = await api.put(`relatorios/${id}/final-thoughts`, { final_thoughts });
        return response.data;
    } catch (error) {
        console.error('Error updating relatorio final thoughts:', error);
        throw error;
    }
}

export async function updateRelatorioReferences(id: string, references: string) {
    try {
        const response = await api.put(`relatorios/${id}/references`, { references });
        return response.data;
    } catch (error) {
        console.error('Error updating relatorio references:', error);
        throw error;
    }
}

export async function submitRelatorio(id: string) {
    try {
        const response = await api.post(`relatorios/${id}/submit`);
        return response.data;
    } catch (error) {
        console.error('Error submitting relatorio:', error);
        throw error;
    }
}

// Baixa o PDF do relatório (com o token da sessão) para o cache do app e
// devolve o caminho local do arquivo, pronto para visualizar ou compartilhar.
export async function downloadRelatorioPDF(id: string): Promise<string> {
    try {
        const token = getAccessToken();
        const destination = `${FileSystem.cacheDirectory}relatorio-${id}.pdf`;

        const result = await FileSystem.downloadAsync(
            `${api.defaults.baseURL}relatorios/${id}/export-pdf`,
            destination,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );

        if (result.status !== 200) {
            throw new Error(`Falha ao baixar o PDF (HTTP ${result.status}).`);
        }

        return result.uri;
    } catch (error) {
        console.error('Error downloading relatorio PDF:', error);
        throw error;
    }
}

// Só relatório em rascunho pode ser excluído (o backend recusa os demais)
export async function deleteRelatorio(id: string) {
    try {
        const response = await api.delete(`relatorios/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting relatorio:', error);
        throw error;
    }
}
