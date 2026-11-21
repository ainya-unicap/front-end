import { api } from "./index";

export async function getAcademicPeriods() {
    try {
        const response = await api.get('academic-periods');
        return response.data;
    } catch (error) {
        console.error('Error fetching academic periods:', error);
        throw error;
    }
}
