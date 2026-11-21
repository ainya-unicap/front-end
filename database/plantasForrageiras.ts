import { api } from "./index";
import { getPlantasCache, savePlantasCache } from "./offlineQueue";

export type PlantCategory =
    | 'CACTACEA'
    | 'CULTURA_ANUAL'
    | 'GRAMINEA_PORTE_ALTO'
    | 'GRAMINEA_PORTE_BAIXO'
    | 'GRAMINEA_PORTE_MEDIO'
    | 'LEGUMINOSA_ARBUSTIVA'
    | 'LEGUMINOSA_HERBACEA'
    | 'OLEAGINOSA_FORRAGEIRA';

export type SemesterFocus = 'PRIMEIRO' | 'SEGUNDO';

function isNetworkError(error: unknown) {
    const e = error as { response?: unknown; code?: string; message?: string };
    return !e?.response && (e?.code === "ERR_NETWORK" || /network/i.test(e?.message ?? ""));
}

function normalizeArray(data: unknown): any[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray((data as any).data)) {
        return (data as any).data;
    }
    return [];
}

function getPlantSemesterFocus(planta: any): string | undefined {
    return planta?.semester_focus ?? planta?.semesterFocus ?? planta?.foco_semestre ?? planta?.focus;
}

function matchesFilters(planta: any, category?: PlantCategory, semesterFocus?: SemesterFocus) {
    if (category && planta?.category !== category) return false;

    if (semesterFocus) {
        const focus = String(getPlantSemesterFocus(planta) ?? '').toUpperCase();
        if (focus === 'AMBOS') return true;
        if (focus !== semesterFocus) return false;
    }

    return true;
}

function filterCachedPlantas(category?: PlantCategory, semesterFocus?: SemesterFocus) {
    const cached = getPlantasCache();
    return cached.filter((planta) => matchesFilters(planta, category, semesterFocus));
}

export async function getPlantas(category?: PlantCategory, semesterFocus?: SemesterFocus) {
    try {
        const params = {
            ...(category ? { category } : {}),
            ...(semesterFocus ? { semester_focus: semesterFocus } : {}),
        };
        const response = await api.get('plantas-forrageiras', { params });
        const data = response.data;

        // Atualiza cache local (salva permanentemente e mantém atualizado quando online)
        try {
            savePlantasCache(data);
            // Se veio filtrado, tenta complementar o catálogo completo em segundo plano
            // (apenas quando há conexão; refresh faz GET direto e falha silenciosamente se offline)
            if (category || semesterFocus) {
                void refreshPlantasCache();
            }
        } catch {
            // cache é best-effort
        }

        return data;
    } catch (error) {
        if (isNetworkError(error)) {
            try {
                const { markOffline } = await import('./offlineSync');
                markOffline();
            } catch {}
            const cached = filterCachedPlantas(category, semesterFocus);
            if (cached.length > 0) {
                return cached;
            }
        }

        console.error('Error fetching plantas forrageiras:', error);
        throw error;
    }
}

export async function refreshPlantasCache() {
    try {
        const response = await api.get('plantas-forrageiras', {
            params: undefined,
            // Evita aguardar sync de fila antes deste GET de cache e reduz risco de recursão
            _skipOfflineSync: true as any,
        } as any);
        savePlantasCache(response.data);
        return response.data;
    } catch (error) {
        // Silencioso: atualização do cache não deve quebrar fluxos principais
        return null;
    }
}

export async function getPlantaById(id: string) {
    try {
        const response = await api.get(`plantas-forrageiras/${id}`);
        const data = response.data;
        try {
            if (data) savePlantasCache([data?.data ?? data]);
        } catch {}
        return data;
    } catch (error) {
        if (isNetworkError(error)) {
            const cached = getPlantasCache().find((p) => String(p?.id ?? p?._id) === String(id));
            if (cached) return cached;
        }
        console.error('Error fetching planta by id:', error);
        throw error;
    }
}
