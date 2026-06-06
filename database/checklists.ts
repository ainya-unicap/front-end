import { api } from "./index";

export async function createChecklistItem(data: { form_id: string; template_id: string; checked: boolean }) {
    try {
        const response = await api.post('checklist', data);
        return response.data;
    } catch (error) {
        console.error('Error creating checklist item:', error);
        throw error;
    }
}
