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

export async function getActiveAcademicPeriod() {
    try {
        const response = await api.get('academic-periods/active');
        return response.data;
    } catch (error) {
        console.error('Error fetching active academic period:', error);
        throw error;
    }
}
