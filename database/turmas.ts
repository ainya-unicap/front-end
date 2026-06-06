import { getUserId } from "./auth";
import { api } from "./index";

export async function getTurmas() {
    try {
        const response = await api.get('turmas');
        return response.data;
    } catch (error) {
        console.error('Error fetching turmas:', error);
        throw error;
    }
}

export async function getTurmaById(id: string) {
    try {
        const response = await api.get(`turmas/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching turma by id:', error);
        throw error;
    }
}

export async function linkUserToTurma(data: { turma_id: string }) {
    try {
        const userId = getUserId();
        const response = await api.post('aluno-turma', { user_id: userId, ...data });
        return response.data;
    } catch (error) {
        console.error('Error linking user to turma:', error);
        throw error;
    }
}

export async function getUserTurmas() {
    try {
        const userId = getUserId();
        const response = await api.get(`aluno-turma/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user turmas:', error);
        throw error;
    }
}
