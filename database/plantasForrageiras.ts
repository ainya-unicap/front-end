import { api } from "./index";

export type PlantCategory = 
    | 'CACTACEA' 
    | 'CULTURA_ANUAL' 
    | 'GRAMINEA_PORTE_ALTO' 
    | 'GRAMINEA_PORTE_BAIXO' 
    | 'GRAMINEA_PORTE_MEDIO' 
    | 'LEGUMINOSA_ARBUSTIVA' 
    | 'LEGUMINOSA_HERBACEA' 
    | 'OLEAGINOSA_FORRAGEIRA';

export async function getPlantas(category?: PlantCategory) {
    try {
        const params = category ? { category } : {};
        const response = await api.get('plantas-forrageiras', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching plantas forrageiras:', error);
        throw error;
    }
}

export async function getPlantaById(id: string) {
    try {
        const response = await api.get(`plantas-forrageiras/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching planta by id:', error);
        throw error;
    }
}
