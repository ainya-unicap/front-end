import { api } from "./index";

// Campos (templates) de medição/checklist configurados para uma planta forrageira.
export async function getPlantTemplates(plantId: string) {
    try {
        const response = await api.get('plant-templates', { params: { plant_id: plantId } });
        return response.data;
    } catch (error) {
        console.error('Error fetching plant templates:', error);
        throw error;
    }
}
