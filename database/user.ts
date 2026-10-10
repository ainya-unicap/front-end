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

export async function uploadProfileAvatar(photo: {
    uri: string;
    mimeType: string;
    fileName: string;
}) {
    const userId = getUserId();
    if (!userId) {
        throw new Error('Usuário não autenticado para enviar a foto.');
    }

    const formData = new FormData();
    formData.append('avatar', {
        uri: photo.uri,
        type: photo.mimeType,
        name: photo.fileName,
    } as any);

    const response = await api.post(`users/${userId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
}