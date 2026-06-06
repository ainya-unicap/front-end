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

export async function exportRelatorioPDF(id: string) {
    try {
        const response = await api.get(`relatorios/${id}/export-pdf`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error('Error exporting relatorio to PDF:', error);
        throw error;
    }
}
