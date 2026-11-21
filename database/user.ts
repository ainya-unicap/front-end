import { getUserId } from "./auth";
import { api } from "./index";
import { getProfileCache, saveProfileCache } from "./offlineQueue";
import { isLikelyOnline, markOffline } from "./offlineSync";

function isNetworkError(error: unknown) {
    const e = error as { response?: unknown; code?: string; message?: string };
    return !e?.response && (e?.code === "ERR_NETWORK" || /network/i.test(e?.message ?? ""));
}

function normalizeProfileData(data: any) {
    return data?.data ?? data;
}

export async function getProfile() {
    const userId = getUserId();
    if (!userId) {
        throw new Error('Usuário não autenticado.');
    }

    try {
        const response = await api.get(`users/${userId}`);
        const data = response.data;
        saveProfileCache(data);
        return data;
    } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403) {
            throw error;
        }

        if (isNetworkError(error) || !isLikelyOnline()) {
            markOffline();
            const cached = getProfileCache();
            if (cached) {
                return cached;
            }
        }

        console.error('Error fetching profile:', error);
        throw error;
    }
}

export async function uploadProfileAvatar(photo: {
    uri: string;
    mimeType: string;
    fileName: string;
}) {
    if (!isLikelyOnline()) {
        throw new Error('A alteração da foto de perfil só pode ser feita quando a conexão com a internet for restabelecida.');
    }

    const userId = getUserId();
    if (!userId) {
        throw new Error('Usuário não autenticado para enviar a foto.');
    }

    try {
        const formData = new FormData();
        formData.append('avatar', {
            uri: photo.uri,
            type: photo.mimeType,
            name: photo.fileName,
        } as any);

        const response = await api.post(`users/${userId}/avatar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Atualiza cache local com o perfil retornado, se houver
        const payload = response.data;
        if (payload) {
            try { saveProfileCache(payload); } catch {}
        }
        return payload;
    } catch (error) {
        if (isNetworkError(error)) {
            markOffline();
            throw new Error('A alteração da foto de perfil só pode ser feita quando a conexão com a internet for restabelecida.');
        }
        throw error;
    }
}

export async function updateProfile(data: {
    name?: string;
    password?: string;
    currentPassword?: string;
    institution_id?: string | null;
}) {
    if (!isLikelyOnline()) {
        throw new Error('A alteração dos dados de perfil só pode ser feita quando a conexão com a internet for restabelecida.');
    }

    const userId = getUserId();
    if (!userId) {
        throw new Error('Usuário não autenticado para atualizar o perfil.');
    }

    try {
        const response = await api.put(`users/${userId}/profile`, data);
        const payload = response.data;
        if (payload) {
            try { saveProfileCache(payload); } catch {}
        }
        return payload;
    } catch (error) {
        if (isNetworkError(error)) {
            markOffline();
            throw new Error('A alteração dos dados de perfil só pode ser feita quando a conexão com a internet for restabelecida.');
        }
        throw error;
    }
}
