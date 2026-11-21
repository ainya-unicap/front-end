import { getUserId } from "./auth";
import { api } from "./index";
import { cachedGet, getApiCache, isNetworkLikeError, setApiCache } from "./offlineCache";
import { enqueueMutation } from "./offlineQueue";
import { isLikelyOnline, markOffline } from "./offlineSync";

export type FormularioType = 'SEMANAL';

export type FormularioPayload = {
    list_id: string;
    type: FormularioType;
    title: string;
    date: string;
    week?: number;
    weather?: 'SOL' | 'NUBLADO' | 'CHUVA';
    estimated_height_cm?: number;
    phenological_stage?: 'VEGETATIVO' | 'ELONGACAO' | 'FLORESCIMENTO';
    checklist_irrigacao: boolean;
    checklist_capina: boolean;
    checklist_adubacao: boolean;
    checklist_plantio: boolean;
    checklist_pragas: boolean;
    observations?: string;
};

function patchCachedFormulario(id: string, data: any) {
    try {
        const key = `formulario:${id}`;
        const cached = getApiCache<any>(key);
        if (!cached) return;
        const base = cached?.data ?? cached;
        const next = { ...base, ...data };
        // mantém envelope se existir
        if (cached?.data) setApiCache(key, { ...cached, data: next });
        else setApiCache(key, next);
    } catch {
        // best-effort
    }
}

export async function getFormularios() {
    const userId = getUserId();
    return cachedGet(`formularios:list:${userId ?? 'anon'}`, async () => {
        const response = await api.get('formularios', { params: { user_id: userId } });
        return response.data;
    });
}

export async function createFormulario(data: FormularioPayload) {
    try {
        const userId = getUserId();
        if (!userId) {
            throw new Error('Usuário não autenticado para criar o formulário.');
        }

        const response = await api.post('formularios', {
            ...data,
            user_id: userId,
        });
        return response.data;
    } catch (error) {
        console.error('Error creating formulario:', error);
        throw error;
    }
}

export async function getFormulariosByUser() {
    const userId = getUserId();
    return cachedGet(`formularios:user:${userId ?? 'anon'}`, async () => {
        const response = await api.get(`formularios/user/${userId}`);
        return response.data;
    });
}

export async function getFormularioById(id: string) {
    return cachedGet(`formulario:${id}`, async () => {
        const response = await api.get(`formularios/${id}`);
        return response.data;
    });
}

export async function updateFormulario(id: string, data: any) {
    if (!isLikelyOnline()) {
        enqueueMutation('update_formulario', data, {
            entityType: 'formulario',
            entityId: String(id),
            displayName: data?.title || 'Formulário (alteração)',
        });
        patchCachedFormulario(String(id), data);
        return { queuedOffline: true as const, id, ...data };
    }

    try {
        const response = await api.put(`formularios/${id}`, data);
        patchCachedFormulario(String(id), data);
        return response.data;
    } catch (error) {
        if (isNetworkLikeError(error)) {
            markOffline();
            enqueueMutation('update_formulario', data, {
                entityType: 'formulario',
                entityId: String(id),
                displayName: data?.title || 'Formulário (alteração)',
            });
            patchCachedFormulario(String(id), data);
            return { queuedOffline: true as const, id, ...data };
        }
        console.error('Error updating formulario:', error);
        throw error;
    }
}

export async function getFormularioPhotos(id: string) {
    return cachedGet(`formulario:${id}:photos`, async () => {
        const response = await api.get(`formularios/${id}/photos`);
        return response.data;
    });
}

export async function uploadFormularioPhoto(
    formId: string,
    photo: { uri: string; mimeType: string; fileName: string }
) {
    try {
        if (!formId || !photo?.uri) {
            return null;
        }

        const userId = getUserId();
        if (!userId) {
            throw new Error('Usuário não autenticado para enviar a foto.');
        }

        const formData = new FormData();
        formData.append('photo', {
            uri: photo.uri,
            type: photo.mimeType,
            name: photo.fileName,
        } as any);
        formData.append('form_id', String(formId));
        formData.append('user_id', String(userId));

        const response = await api.post('photos/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function finalizarFormulario(id: string) {
    if (!isLikelyOnline()) {
        enqueueMutation('finalizar_formulario', {}, {
            entityType: 'formulario',
            entityId: String(id),
            displayName: 'Finalizar formulário',
        });
        patchCachedFormulario(String(id), { synced: true });
        return { queuedOffline: true as const, id };
    }

    try {
        const response = await api.post(`formularios/${id}/finalizar`);
        patchCachedFormulario(String(id), { synced: true });
        return response.data;
    } catch (error) {
        if (isNetworkLikeError(error)) {
            markOffline();
            enqueueMutation('finalizar_formulario', {}, {
                entityType: 'formulario',
                entityId: String(id),
                displayName: 'Finalizar formulário',
            });
            patchCachedFormulario(String(id), { synced: true });
            return { queuedOffline: true as const, id };
        }
        console.error('Error finalizing formulario:', error);
        throw error;
    }
}

export async function syncFormulario(id: string) {
    try {
        const response = await api.post(`formularios/${id}/sync`);
        return response.data;
    } catch (error) {
        console.error('Error syncing formulario:', error);
        throw error;
    }
}
