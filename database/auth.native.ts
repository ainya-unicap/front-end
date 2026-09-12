import db from "./localDb";
import { api } from "./index";
import { extractApiError } from "@/lib/apiError";
import { parsePerfil, PerfilAcademico } from "@/lib/perfil";

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

export type LoginInput = {
    matricula: string;
    senha: string;
};

export type LoginResult =
    | { ok: true; perfil: PerfilAcademico | null }
    | { ok: false; message: string };

/**
 * Autentica pela matrícula. O perfil (aluno ou professor) é definido pelo
 * backend e apenas lido aqui — o cliente não deduz o vínculo acadêmico.
 */
export async function login({ matricula, senha }: LoginInput): Promise<LoginResult> {
    try {
        const response = await api.post('users/login', { matricula, password: senha });
        const { accessToken, refreshToken, id, role } = response.data ?? {};

        if (accessToken) saveAccessToken(accessToken);
        if (refreshToken) saveRefreshToken(refreshToken);
        if (id) saveUserId(id);

        const perfil = parsePerfil(role);
        if (perfil) saveUserRole(perfil);

        return { ok: true, perfil };
    } catch (error) {
        console.error('Error during login:', error);
        return {
            ok: false,
            message: extractApiError(
                error,
                'Não foi possível entrar. Confira sua matrícula e senha.'
            ),
        };
    }
}

export async function logout() {
    try {
        const response = await api.post('users/logout', { refreshToken: getRefreshToken() });
        deleteAccessToken();
        deleteRefreshToken();
        deleteUserRole();
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

export function saveUserRole(role: PerfilAcademico) {
    db.runSync(`
        INSERT INTO auth (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value=excluded.value;
    `, ["user_role", role]);
}

export function getUserRole(): PerfilAcademico | null {
  const row = db.getFirstSync<{ value: string }>(
    `SELECT value FROM auth WHERE key = ?`,
    ['user_role']
  );
  return parsePerfil(row?.value ?? null);
}

export function deleteUserRole() {
    db.runSync(`
        DELETE FROM auth WHERE key = ?;
    `, ["user_role"]);
}
