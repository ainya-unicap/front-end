import { getUserId } from "./auth";
import { api } from "./index";

export async function getCanteiros() {
    try {
        const response = await api.get('canteiros');
        return response.data;
    } catch (error) {
        console.error('Error fetching canteiros:', error);
        throw error;
    }
}

// O backend cria canteiro, vínculo com o usuário do token e lista de formulários numa transação.
export async function createCanteiro(data: { plant_id: string; name: string; list_name?: string }) {
    try {
        const response = await api.post('canteiros', data);
        return response.data;
    } catch (error) {
        console.error('Error creating canteiro:', error);
        throw error;
    }
}

export async function getCanteirosByUser() {
    try {
        const userId = getUserId();
        const response = await api.get(`canteiros/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user canteiros:', error);
        throw error;
    }
}

export async function getCanteiroListas(canteiroId: string) {
    try {
        const response = await api.get(`canteiros/${canteiroId}/listas`);
        return response.data;
    } catch (error) {
        console.error('Error fetching canteiro listas:', error);
        throw error;
    }
}

// Listas do canteiro, cada uma com seus registros e fotos (exclusivo de quem é vinculado)
export async function getCanteiroFormularios(canteiroId: string) {
    try {
        const response = await api.get(`canteiros/${canteiroId}/formularios`);
        return response.data;
    } catch (error) {
        console.error('Error fetching canteiro formularios:', error);
        throw error;
    }
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
