import db from "./localDb";
import { api } from "./index";
import { Alert } from "react-native";

export function saveAccessToken(token: string) {
  localStorage.setItem("access_token", token);
}

export function saveRefreshToken(token: string) {
  localStorage.setItem("refresh_token", token);
}

export function saveUserId(userId: string) {
  localStorage.setItem("user_id", userId);
}

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

export function getUserId() {
  return localStorage.getItem("user_id");
}

export function deleteAccessToken() {
  localStorage.removeItem("access_token");
}

export function deleteRefreshToken() {
  localStorage.removeItem("refresh_token");
}

export function deleteUserId() {
  localStorage.removeItem("user_id");
}

export async function cadastro({ role, name, email, instituicao, senha }: any) {
    try {
        const response = await api.post('users', { role, name, email, instituicao, password: senha }); 
        return response.data;
    } catch (error) {
        console.error('Error fetching institutions:', error);
        throw error;
    }
}

export async function login({ email, senha }: any) {
    try {
        const response = await api.post('users/login', { email, password: senha });
        saveAccessToken(response.data.accessToken);
        saveRefreshToken(response.data.refreshToken);
        saveUserId(response.data.id);
        return {
            status: response.status,
            data: response.data
        }
    } catch (error: any) {
        console.error('Error during login:', error);
        return {
            status: error.response?.status || 500,
            data: "Ocorreu um erro ao realizar o login."
        }
    }
}

export async function logout() {
    try {
        const response = await api.post('users/logout', { refreshToken: getRefreshToken() });
        deleteAccessToken();
        deleteRefreshToken();
        return {
            status: response.status,
            data: response.data
        }
    } catch (error: any) {
        console.error('Error during logout:', error);
        return {
            status: error.response?.status || 500,
            data: "Ocorreu um erro ao realizar o logout."
        }
    }
}