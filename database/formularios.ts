import { getUserId } from "./auth";
import { api } from "./index";

export type FormularioType = 'SEMANAL';

export async function getFormularios() {
    try {
        const userId = getUserId();
        const response = await api.get('formularios', { params: { user_id: userId } });
        return response.data;
    } catch (error) {
        console.error('Error fetching formularios:', error);
        throw error;
    }
}

export async function createFormulario(data: { list_id: string; type: FormularioType; observations?: string }) {
    try {
        const userId = getUserId();
        if (!userId) {
            throw new Error('Usuário não autenticado para criar o formulário.');
        }

        const response = await api.post('formularios', {
            ...data,
            user_id: userId,
        });
        return response.data;
    } catch (error) {
        console.error('Error creating formulario:', error);
        throw error;
    }
}

export async function getFormulariosByUser() {
    try {
        const userId = getUserId();
        const response = await api.get(`formularios/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching formularios by user:', error);
        throw error;
    }
}

export async function getFormularioById(id: string) {
    try {
        const response = await api.get(`formularios/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching formulario by id:', error);
        throw error;
    }
}

export async function updateFormulario(id: string, data: any) {
    try {
        const response = await api.put(`formularios/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating formulario:', error);
        throw error;
    }
}

export async function getFormularioChecklist(id: string) {
    try {
        const response = await api.get(`formularios/${id}/checklist`);
        return response.data;
    } catch (error) {
        console.error('Error fetching formulario checklist:', error);
        throw error;
    }
}

export async function createChecklistItems(formId: string, templateIds: string[]) {
    try {
        const response = await api.post(`formularios/${formId}/checklist`, { template_ids: templateIds });
        return response.data;
    } catch (error) {
        console.error('Error creating checklist items:', error);
        throw error;
    }
}

export async function getFormularioMeasurements(id: string) {
    try {
        const response = await api.get(`formularios/${id}/measurements`);
        return response.data;
    } catch (error) {
        console.error('Error fetching formulario measurements:', error);
        throw error;
    }
}

export async function createMeasurements(formId: string, measurements: Array<{ template_id: string; value: number }>) {
    try {
        const response = await api.post(`formularios/${formId}/measurements`, { measurements });
        return response.data;
    } catch (error) {
        console.error('Error creating measurements:', error);
        throw error;
    }
}

export async function getFormularioPhotos(id: string) {
    try {
        const response = await api.get(`formularios/${id}/photos`);
        return response.data;
    } catch (error) {
        console.error('Error fetching formulario photos:', error);
        throw error;
    }
}

export async function uploadFormularioPhoto(
    formId: string,
    photo: { uri: string; mimeType: string; fileName: string }
) {
    try {
        if (!formId || !photo?.uri) {
            return null;
        }

        const userId = getUserId();
        if (!userId) {
            throw new Error('Usuário não autenticado para enviar a foto.');
        }

        const formData = new FormData();
        formData.append('photo', {
            uri: photo.uri,
            type: photo.mimeType,
            name: photo.fileName,
        } as any);
        formData.append('form_id', String(formId));
        formData.append('user_id', String(userId));

        const response = await api.post('photos/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
}

export async function finalizarFormulario(id: string) {
    try {
        const response = await api.post(`formularios/${id}/finalizar`);
        return response.data;
    } catch (error) {
        console.error('Error finalizing formulario:', error);
        throw error;
    }
}

export async function syncFormulario(id: string) {
    try {
        const response = await api.post(`formularios/${id}/sync`);
        return response.data;
    } catch (error) {
        console.error('Error syncing formulario:', error);
        throw error;
    }
}
