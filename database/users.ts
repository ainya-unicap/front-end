import { getUserId } from "./auth";
import { api } from "./index";

export async function updateUserProfile(data: { name?: string; password?: string }) {
    try {
        const userId = getUserId();
        const response = await api.put(`users/${userId}/profile`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

export async function getUserSummary() {
    try {
        const userId = getUserId();
        const response = await api.get(`alunos/${userId}/resumo`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user summary:', error);
        throw error;
    }
}

export async function getUserHome() {
    try {
        const userId = getUserId();
        const response = await api.get(`alunos/${userId}/home`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user home:', error);
        throw error;
    }
}
