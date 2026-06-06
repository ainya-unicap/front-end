import { api } from './index';

export async function getInstitutions() {
    try {
        const response = await api.get('institutions');
        return response.data;
    } catch (error) {
        console.error('Error fetching institutions:', error);
        throw error;
    }
}

export async function createInstitution(data: { name: string }) {
    try {
        const response = await api.post('institutions', data);
        return response.data;
    } catch (error) {
        console.error('Error creating institution:', error);
        throw error;
    }
}