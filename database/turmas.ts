import { api } from "./index";

export type EntregaRelatorio = {
    id: string;
    fileName: string;
    fileUrl: string;
    submittedAt: string;
    // true dentro de 24 h do envio
    podeCancelar: boolean;
};

export type MinhaTurma = {
    id: string;
    name: string;
    period?: { id: string; name: string; semester?: string } | null;
    institution?: { id: string; name: string } | null;
    entrega: EntregaRelatorio | null;
};

// Turmas em que o aluno entrou, cada uma já com a entrega (PDF) dele, se houver
export async function getMinhasTurmas(): Promise<MinhaTurma[]> {
    try {
        const response = await api.get('turmas/minhas');
        return response.data;
    } catch (error) {
        console.error('Error fetching minhas turmas:', error);
        throw error;
    }
}

// O aluno nunca escolhe a turma: entra com o código que a professora passou
export async function entrarNaTurma(code: string) {
    const response = await api.post('turmas/entrar', { code });
    return response.data as { id: string; name: string };
}

// Um PDF por aluno e turma: reenviar substitui a entrega anterior
export async function enviarRelatorioParaTurma(
    turmaId: string,
    arquivo: { uri: string; name: string }
) {
    const formData = new FormData();
    formData.append('file', {
        uri: arquivo.uri,
        type: 'application/pdf',
        name: arquivo.name,
    } as any);

    const response = await api.post(`turmas/${turmaId}/relatorios`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as EntregaRelatorio;
}

// Só funciona nas primeiras 24 h depois do envio
export async function cancelarEntregaDaTurma(turmaId: string) {
    const response = await api.delete(`turmas/${turmaId}/relatorios`);
    return response.data;
}
