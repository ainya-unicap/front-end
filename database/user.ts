import { getUserId } from "./auth";
import { api } from "./index";

export async function getProfile() {
    try {
        const response = await api.get(`users/${getUserId()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
    }
}