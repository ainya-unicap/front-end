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

export async function updateProfile(data: {
    name?: string;
    password?: string;
    currentPassword?: string;
    institution_id?: string | null;
}) {
    const userId = getUserId();
    if (!userId) {
        throw new Error('Usuário não autenticado para atualizar o perfil.');
    }

    const response = await api.put(`users/${userId}/profile`, data);
    return response.data;
}

// turmaId null desvincula o aluno; o período letivo é sempre o da turma.
export async function updateTurma(turmaId: string | null) {
    const userId = getUserId();
    if (!userId) {
        throw new Error('Usuário não autenticado para atualizar a turma.');
    }

    const response = await api.put(`users/${userId}/turma`, { turma_id: turmaId });
    return response.data;
}