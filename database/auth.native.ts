import db from "./localDb";
import { api } from "./index";
import { Alert } from "react-native";

export function saveAccessToken(token: string) {
    db.runSync(`
        INSERT INTO auth (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value=excluded.value;
    `, ["access_token", token]);
}

export function saveRefreshToken(token: string) {
    db.runSync(`
        INSERT INTO auth (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value=excluded.value;
    `, ["refresh_token", token]);
}

export function saveUserId(userId: string) {
    db.runSync(`
        INSERT INTO auth (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value=excluded.value;
    `, ["user_id", userId]);
}

export function deleteAccessToken() {
    db.runSync(`
        DELETE FROM auth WHERE key = ?;
    `, ["access_token"]);
}

export function deleteRefreshToken() {
    db.runSync(`
        DELETE FROM auth WHERE key = ?;
    `, ["refresh_token"]);
}

export function deleteUserId() {
    db.runSync(`
        DELETE FROM auth WHERE key = ?;
    `, ["user_id"]);
}

export function getAccessToken(): string | null {
  const row = db.getFirstSync<{ value: string }>(
    `SELECT value FROM auth WHERE key = ?`,
    ['access_token']
  );

  return row?.value ?? null;
}

export function getRefreshToken(): string | null {
  const row = db.getFirstSync<{ value: string }>(
    `SELECT value FROM auth WHERE key = ?`,
    ['refresh_token']
  );
  return row?.value ?? null;
}

export function getUserId(): string | null {
  const row = db.getFirstSync<{ value: string }>(
    `SELECT value FROM auth WHERE key = ?`,
    ['user_id']
  );
  return row?.value ?? null;
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