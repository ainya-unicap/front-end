import { getUserId } from "./auth";
import { api } from "./index";
import { cachedGet } from "./offlineCache";

export async function getRelatorios() {
    const userId = getUserId();
    return cachedGet(`relatorios:user:${userId ?? 'anon'}`, async () => {
        const response = await api.get(`relatorios/user/${userId}`);
        return response.data;
    });
}