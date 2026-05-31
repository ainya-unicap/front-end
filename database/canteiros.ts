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

export async function createCanteiro(data: { plant_id: string; name: string; user_id?: string }) {
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
