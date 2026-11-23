import { getUserId } from "./auth";
import { api } from "./index";

export async function getRelatorios() {
    try {
        const response = await api.get(`relatorios/user/${getUserId()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching relatorios:', error);
        throw error;
    }
}