import { api } from "./index";
import { cachedGet } from "./offlineCache";

export async function createListaFormulario(data: { canteiro_id: string; name: string }) {
    try {
        const response = await api.post('listas-formularios', data);
        return response.data;
    } catch (error) {
        console.error('Error creating lista formulario:', error);
        throw error;
    }
}

export async function getListasByCanterio(canteiroId: string) {
    return cachedGet(`listas:canteiro:${canteiroId}`, async () => {
        const response = await api.get(`listas-formularios/canteiro/${canteiroId}`);
        return response.data;
    });
}

export async function getListaById(listaId: string) {
    return cachedGet(`lista:${listaId}`, async () => {
        const response = await api.get(`listas-formularios/${listaId}`);
        return response.data;
    });
}

export async function getListaFormularios(listaId: string) {
    return cachedGet(`lista:${listaId}:formularios`, async () => {
        const response = await api.get(`listas-formularios/${listaId}/formularios`);
        return response.data;
    });
}
