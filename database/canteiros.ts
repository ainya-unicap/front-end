import { getUserId } from "./auth";
import { api } from "./index";
import { enqueueCanteiro, enqueueMutation } from "./offlineQueue";
import { isLikelyOnline, markOffline } from "./offlineSync";
import { cachedGet, getApiCache, isNetworkLikeError, setApiCache } from "./offlineCache";

function isNetworkError(error: unknown) {
    const e = error as { response?: unknown; code?: string; message?: string };
    return !e?.response && (e?.code === "ERR_NETWORK" || /network/i.test(e?.message ?? ""));
}

export async function getCanteiros() {
    return cachedGet('canteiros:list', async () => {
        const response = await api.get('canteiros');
        return response.data;
    });
}

// O backend cria canteiro, vínculo com o usuário do token e lista de formulários numa transação.
export async function createCanteiro(data: { plant_id: string; name: string; list_name?: string; turma_id?: string }) {
    if (!isLikelyOnline()) {
        enqueueCanteiro(data);
        return { queuedOffline: true as const, name: data.name };
    }

    try {
        const response = await api.post('canteiros', data);
        return response.data;
    } catch (error) {
        if (isNetworkError(error)) {
            markOffline();
            enqueueCanteiro(data);
            return { queuedOffline: true as const, name: data.name };
        }
        console.error('Error creating canteiro:', error);
        throw error;
    }
}

export async function getCanteirosByUser() {
    const userId = getUserId();
    const key = `canteiros:user:${userId ?? 'anon'}`;
    try {
        const response = await api.get(`canteiros/user/${userId}`);
        setApiCache(key, response.data);
        return response.data;
    } catch (error) {
        if (isNetworkLikeError(error)) {
            const cached = getApiCache(key);
            if (cached != null) return cached;
        }
        console.error('Error fetching user canteiros:', error);
        throw error;
    }
}

export async function getCanteiroListas(canteiroId: string) {
    return cachedGet(`canteiro:${canteiroId}:listas`, async () => {
        const response = await api.get(`canteiros/${canteiroId}/listas`);
        return response.data;
    });
}

// Listas do canteiro, cada uma com seus registros e fotos (exclusivo de quem é vinculado)
export async function getCanteiroFormularios(canteiroId: string) {
    return cachedGet(`canteiro:${canteiroId}:formularios`, async () => {
        const response = await api.get(`canteiros/${canteiroId}/formularios`);
        return response.data;
    });
}

// Exclui o canteiro; se houver outros alunos vinculados, só remove o vínculo de quem pediu
export async function deleteCanteiro(canteiroId: string) {
    try {
        const response = await api.delete(`canteiros/${canteiroId}`);
        return response.data as { message: string; removido: 'vinculo' | 'canteiro' };
    } catch (error) {
        console.error('Error deleting canteiro:', error);
        throw error;
    }
}

function patchCachedCanteiro(canteiroId: string, data: { name?: string; plant_id?: string }) {
    try {
        const userId = getUserId();
        const key = `canteiros:user:${userId ?? 'anon'}`;
        const cached = getApiCache<any>(key);
        if (!cached) return;

        const patchItem = (item: any) => {
            if (String(item?.id) !== String(canteiroId)) return item;
            const next = { ...item };
            if (data.name != null) next.name = data.name;
            if (data.plant_id != null) {
                next.plant_id = data.plant_id;
                if (next.plant && typeof next.plant === 'object') {
                    next.plant = { ...next.plant, id: data.plant_id };
                }
            }
            return next;
        };

        if (Array.isArray(cached)) {
            setApiCache(key, cached.map(patchItem));
        } else if (cached && Array.isArray(cached.data)) {
            setApiCache(key, { ...cached, data: cached.data.map(patchItem) });
        }
    } catch {
        // best-effort
    }
}

// Altera o nome e/ou a planta. A planta só pode ser trocada enquanto o canteiro
// não tiver formulários (o backend recusa com CANTEIRO_COM_FORMULARIOS).
export async function updateCanteiro(
    canteiroId: string,
    data: { name?: string; plant_id?: string }
) {
    if (!isLikelyOnline()) {
        enqueueMutation('update_canteiro', data, {
            entityType: 'canteiro',
            entityId: String(canteiroId),
            displayName: data.name || 'Canteiro (alteração)',
        });
        patchCachedCanteiro(String(canteiroId), data);
        return { queuedOffline: true as const, id: canteiroId, ...data };
    }

    try {
        const response = await api.put(`canteiros/${canteiroId}`, data);
        patchCachedCanteiro(String(canteiroId), data);
        return response.data;
    } catch (error) {
        if (isNetworkLikeError(error)) {
            markOffline();
            enqueueMutation('update_canteiro', data, {
                entityType: 'canteiro',
                entityId: String(canteiroId),
                displayName: data.name || 'Canteiro (alteração)',
            });
            patchCachedCanteiro(String(canteiroId), data);
            return { queuedOffline: true as const, id: canteiroId, ...data };
        }
        console.error('Error updating canteiro:', error);
        throw error;
    }
}
