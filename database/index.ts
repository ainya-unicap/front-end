import axios from 'axios';
import { router } from 'expo-router';
import { getAccessToken, getRefreshToken, getUserId, logout, saveAccessToken, saveRefreshToken } from './auth';

export const api = axios.create({
    baseURL: 'https://back-end-ainya.vercel.app/api/',
    headers: {
        'Content-Type': 'application/json',
    }
})

api.interceptors.request.use((config) =>  {
    const token = getAccessToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Antes de qualquer GET (após login), envia dados pendentes do modo offline
api.interceptors.request.use(async (config) => {
    const method = String(config.method ?? 'get').toLowerCase();
    const skip = (config as any)._skipOfflineSync;
    if (method !== 'get' || skip) return config;
    if (!getAccessToken() || !getUserId()) return config;

    try {
        const mod = await import('./offlineSync');
        await mod.ensureSyncedBeforeGet();
    } catch {
        // falha de sync não deve bloquear a requisição original
    }

    return config;
});

// O token de acesso vale 15 min. Ao receber 401, troca o refreshToken por um novo
// par e repete a requisição; se a renovação falhar, encerra a sessão local.
const AUTH_PATHS = ['users/login', 'users/refresh', 'users/logout', 'users/password-recovery'];
let refreshing: Promise<string | null> | null = null;

async function renewSession(): Promise<string | null> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
        // Instância pura do axios: sem os interceptors, para não entrar em loop
        const { data } = await axios.post(`${api.defaults.baseURL}users/refresh`, { refreshToken });
        if (!data?.accessToken) return null;

        saveAccessToken(data.accessToken);
        if (data.refreshToken) saveRefreshToken(data.refreshToken);
        return data.accessToken as string;
    } catch {
        return null;
    }
}

api.interceptors.response.use(
    (response) => {
        try {
            void import('./offlineSync').then((mod) => mod.markOnline());
        } catch {
            // ignore
        }
        return response;
    },
    async (error) => {
        const original = error.config;
        const isAuthCall = AUTH_PATHS.some((path) => String(original?.url ?? '').includes(path));

        if (error.response?.status !== 401 || !original || original._retry || isAuthCall) {
            // Sinaliza perda de conexão para o gerenciador de sincronização
            if (!error.response && !(original as any)?._skipOfflineSync) {
                try {
                    const mod = await import('./offlineSync');
                    mod.markOffline();
                } catch {
                    // ignore
                }
            }
            throw error;
        }
        original._retry = true;

        // Várias chamadas podem falhar juntas: todas esperam a mesma renovação
        refreshing ??= renewSession().finally(() => {
            refreshing = null;
        });
        const accessToken = await refreshing;

        if (!accessToken) {
            await logout();
            router.replace('/login');
            throw error;
        }

        original.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(original);
    }
);
