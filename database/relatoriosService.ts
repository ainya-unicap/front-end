import * as FileSystem from "expo-file-system/legacy";

import { getAccessToken, getUserId } from "./auth";
import { api } from "./index";
import { cachedGet, getApiCache, isNetworkLikeError, setApiCache } from "./offlineCache";
import { enqueueMutation } from "./offlineQueue";
import { isLikelyOnline, markOffline } from "./offlineSync";

function patchCachedRelatorio(id: string, patch: any) {
    try {
        const key = `relatorio:${id}`;
        const cached = getApiCache<any>(key);
        if (!cached) return;
        const base = cached?.data ?? cached;
        const next = { ...base, ...patch };
        if (cached?.data) setApiCache(key, { ...cached, data: next });
        else setApiCache(key, next);
    } catch {
        // best-effort
    }
}

// tipo = 'simples' já devolve o relatório com todos os formulários da lista organizados
export async function generateRelatorio(data: { list_id: string; tipo?: 'simples' }) {
    if (!isLikelyOnline()) {
        enqueueMutation('generate_relatorio', data, {
            entityType: 'relatorio',
            displayName: 'Gerar relatório',
        });
        return { queuedOffline: true as const };
    }

    try {
        const response = await api.post('relatorios/generate', data);
        return response.data;
    } catch (error) {
        if (isNetworkLikeError(error)) {
            markOffline();
            enqueueMutation('generate_relatorio', data, {
                entityType: 'relatorio',
                displayName: 'Gerar relatório',
            });
            return { queuedOffline: true as const };
        }
        console.error('Error generating relatorio:', error);
        throw error;
    }
}

export async function generateRelatorioComAnalise(canteiroId: string) {
    if (!isLikelyOnline()) {
        enqueueMutation('generate_relatorio_analise', { canteiroId }, {
            entityType: 'relatorio',
            entityId: String(canteiroId),
            displayName: 'Gerar relatório com IA',
        });
        return { queuedOffline: true as const };
    }

    try {
        const response = await api.post(`canteiros/${canteiroId}/relatorio-ia`);
        return response;
    } catch (error) {
        if (isNetworkLikeError(error)) {
            markOffline();
            enqueueMutation('generate_relatorio_analise', { canteiroId }, {
                entityType: 'relatorio',
                entityId: String(canteiroId),
                displayName: 'Gerar relatório com IA',
            });
            return { queuedOffline: true as const };
        }
        console.error('Error generating relatorio com analise:', error);
        throw error;
    }
}

export async function getRelatorioById(id: string) {
    return cachedGet(`relatorio:${id}`, async () => {
        const response = await api.get(`relatorios/${id}`);
        return response.data;
    });
}

export async function updateRelatorio(id: string, data: {
    introduction?: string;
    objective?: string;
    development?: string;
    final_thoughts?: string;
    references?: string;
}) {
    if (!isLikelyOnline()) {
        enqueueMutation('update_relatorio', data, { entityType: 'relatorio', entityId: String(id), displayName: 'Relatório (alteração)' });
        patchCachedRelatorio(String(id), data);
        return { queuedOffline: true as const };
    }
    try {
        const response = await api.put(`relatorios/${id}`, data);
        patchCachedRelatorio(String(id), data);
        return response.data;
    } catch (error) {
        if (isNetworkLikeError(error)) {
            markOffline();
            enqueueMutation('update_relatorio', data, { entityType: 'relatorio', entityId: String(id), displayName: 'Relatório (alteração)' });
            patchCachedRelatorio(String(id), data);
            return { queuedOffline: true as const };
        }
        console.error('Error updating relatorio:', error);
        throw error;
    }
}

export async function updateRelatorioObjective(id: string, objective: string) {
    if (!isLikelyOnline()) {
        enqueueMutation('update_relatorio_objective', { objective }, { entityType: 'relatorio', entityId: String(id), displayName: 'Relatório (objetivo)' });
        patchCachedRelatorio(String(id), { objective });
        return { queuedOffline: true as const };
    }
    try {
        const response = await api.put(`relatorios/${id}/objective`, { objective });
        patchCachedRelatorio(String(id), { objective });
        return response.data;
    } catch (error) {
        if (isNetworkLikeError(error)) {
            markOffline();
            enqueueMutation('update_relatorio_objective', { objective }, { entityType: 'relatorio', entityId: String(id), displayName: 'Relatório (objetivo)' });
            patchCachedRelatorio(String(id), { objective });
            return { queuedOffline: true as const };
        }
        console.error('Error updating relatorio objective:', error);
        throw error;
    }
}

export async function updateRelatorioIntroduction(id: string, introduction: string) {
    if (!isLikelyOnline()) {
        enqueueMutation('update_relatorio_introduction', { introduction }, { entityType: 'relatorio', entityId: String(id), displayName: 'Relatório (introdução)' });
        patchCachedRelatorio(String(id), { introduction });
        return { queuedOffline: true as const };
    }
    try {
        const response = await api.put(`relatorios/${id}/introduction`, { introduction });
        patchCachedRelatorio(String(id), { introduction });
        return response.data;
    } catch (error) {
        if (isNetworkLikeError(error)) {
            markOffline();
            enqueueMutation('update_relatorio_introduction', { introduction }, { entityType: 'relatorio', entityId: String(id), displayName: 'Relatório (introdução)' });
            patchCachedRelatorio(String(id), { introduction });
            return { queuedOffline: true as const };
        }
        console.error('Error updating relatorio introduction:', error);
        throw error;
    }
}

export async function updateRelatorioDevelopment(id: string, development: string) {
    if (!isLikelyOnline()) {
        enqueueMutation('update_relatorio_development', { development }, { entityType: 'relatorio', entityId: String(id), displayName: 'Relatório (desenvolvimento)' });
        patchCachedRelatorio(String(id), { development });
        return { queuedOffline: true as const };
    }
    try {
        const response = await api.put(`relatorios/${id}/development`, { development });
        patchCachedRelatorio(String(id), { development });
        return response.data;
    } catch (error) {
        if (isNetworkLikeError(error)) {
            markOffline();
            enqueueMutation('update_relatorio_development', { development }, { entityType: 'relatorio', entityId: String(id), displayName: 'Relatório (desenvolvimento)' });
            patchCachedRelatorio(String(id), { development });
            return { queuedOffline: true as const };
        }
        console.error('Error updating relatorio development:', error);
        throw error;
    }
}

export async function updateRelatorioFinalThoughts(id: string, final_thoughts: string) {
    if (!isLikelyOnline()) {
        enqueueMutation('update_relatorio_final_thoughts', { final_thoughts }, { entityType: 'relatorio', entityId: String(id), displayName: 'Relatório (considerações finais)' });
        patchCachedRelatorio(String(id), { final_thoughts });
        return { queuedOffline: true as const };
    }
    try {
        const response = await api.put(`relatorios/${id}/final-thoughts`, { final_thoughts });
        patchCachedRelatorio(String(id), { final_thoughts });
        return response.data;
    } catch (error) {
        if (isNetworkLikeError(error)) {
            markOffline();
            enqueueMutation('update_relatorio_final_thoughts', { final_thoughts }, { entityType: 'relatorio', entityId: String(id), displayName: 'Relatório (considerações finais)' });
            patchCachedRelatorio(String(id), { final_thoughts });
            return { queuedOffline: true as const };
        }
        console.error('Error updating relatorio final thoughts:', error);
        throw error;
    }
}

export async function updateRelatorioReferences(id: string, references: string) {
    if (!isLikelyOnline()) {
        enqueueMutation('update_relatorio_references', { references }, { entityType: 'relatorio', entityId: String(id), displayName: 'Relatório (referências)' });
        patchCachedRelatorio(String(id), { references });
        return { queuedOffline: true as const };
    }
    try {
        const response = await api.put(`relatorios/${id}/references`, { references });
        patchCachedRelatorio(String(id), { references });
        return response.data;
    } catch (error) {
        if (isNetworkLikeError(error)) {
            markOffline();
            enqueueMutation('update_relatorio_references', { references }, { entityType: 'relatorio', entityId: String(id), displayName: 'Relatório (referências)' });
            patchCachedRelatorio(String(id), { references });
            return { queuedOffline: true as const };
        }
        console.error('Error updating relatorio references:', error);
        throw error;
    }
}

export async function submitRelatorio(id: string) {
    if (!isLikelyOnline()) {
        enqueueMutation('submit_relatorio', {}, { entityType: 'relatorio', entityId: String(id), displayName: 'Enviar relatório' });
        patchCachedRelatorio(String(id), { status: 'SUBMETIDO' });
        return { queuedOffline: true as const };
    }
    try {
        const response = await api.post(`relatorios/${id}/submit`);
        patchCachedRelatorio(String(id), { status: 'SUBMETIDO' });
        return response.data;
    } catch (error) {
        if (isNetworkLikeError(error)) {
            markOffline();
            enqueueMutation('submit_relatorio', {}, { entityType: 'relatorio', entityId: String(id), displayName: 'Enviar relatório' });
            patchCachedRelatorio(String(id), { status: 'SUBMETIDO' });
            return { queuedOffline: true as const };
        }
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

function removeRelatorioFromCachedList(id: string) {
    try {
        const userId = getUserId();
        const key = `relatorios:user:${userId ?? 'anon'}`;
        const cached = getApiCache<any>(key);
        if (!cached) return;
        if (Array.isArray(cached)) {
            setApiCache(key, cached.filter((item: any) => String(item?.id) !== String(id)));
            return;
        }
        if (cached && Array.isArray(cached.data)) {
            setApiCache(key, { ...cached, data: cached.data.filter((item: any) => String(item?.id) !== String(id)) });
        }
    } catch {
        // best-effort
    }
}

// Só relatório em rascunho pode ser excluído (o backend recusa os demais)
export async function deleteRelatorio(id: string) {
    if (!isLikelyOnline()) {
        enqueueMutation('delete_relatorio', {}, { entityType: 'relatorio', entityId: String(id), displayName: 'Excluir relatório' });
        removeRelatorioFromCachedList(String(id));
        return { queuedOffline: true as const };
    }
    try {
        const response = await api.delete(`relatorios/${id}`);
        removeRelatorioFromCachedList(String(id));
        return response.data;
    } catch (error) {
        if (isNetworkLikeError(error)) {
            markOffline();
            enqueueMutation('delete_relatorio', {}, { entityType: 'relatorio', entityId: String(id), displayName: 'Excluir relatório' });
            removeRelatorioFromCachedList(String(id));
            return { queuedOffline: true as const };
        }
        console.error('Error deleting relatorio:', error);
        throw error;
    }
}
