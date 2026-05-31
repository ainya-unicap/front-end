import { getUserId } from "./auth";
import { api } from "./index";

export function getRelatorios() {
    try {
        const response = api.get(`relatorios/user/${getUserId()}`);
        return response;
    } catch (error) {
        console.error('Error fetching relatorios:', error);
        throw error;
    }
}