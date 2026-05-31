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