import { api } from "./index";

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
    try {
        const response = await api.get(`listas-formularios/canteiro/${canteiroId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching listas by canteiro:', error);
        throw error;
    }
}

export async function getListaById(listaId: string) {
    try {
        const response = await api.get(`listas-formularios/${listaId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching lista by id:', error);
        throw error;
    }
}

export async function getListaFormularios(listaId: string) {
    try {
        const response = await api.get(`listas-formularios/${listaId}/formularios`);
        return response.data;
    } catch (error) {
        console.error('Error fetching lista formularios:', error);
        throw error;
    }
}
