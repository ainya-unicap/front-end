import { getUserId } from "./auth";
import { api } from "./index";

export async function linkUserToCanteiro(data: { canteiro_id: string }) {
    try {
        const response = await api.post('user-canteiros', data);
        return response.data;
    } catch (error) {
        console.error('Error linking user to canteiro:', error);
        throw error;
    }
}

export async function unlinkUserFromCanteiro(data: { canteiro_id: string }) {
    try {
        const response = await api.delete('user-canteiros', { data });
        return response.data;
    } catch (error) {
        console.error('Error unlinking user from canteiro:', error);
        throw error;
    }
}

export async function getUserCanteiros() {
    try {
        const userId = getUserId();
        const response = await api.get(`user-canteiros/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user canteiros:', error);
        throw error;
    }
}

export async function getCanteiroUsers(canteiroId: string) {
    try {
        const response = await api.get(`user-canteiros/canteiro/${canteiroId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching canteiro users:', error);
        throw error;
    }
}
