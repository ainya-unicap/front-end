import { api } from "./index";
import { extractApiError } from "@/lib/apiError";
import { parsePerfil, PerfilAcademico } from "@/lib/perfil";

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

export type CadastroInput = {
    role: PerfilAcademico;
    name: string;
    matricula: string;
    email: string;
    instituicao: string;
    senha: string;
};

export type CadastroResult =
    | { ok: true; perfil: PerfilAcademico | null }
    | { ok: false; message: string };

/**
 * Cria a conta enviando a matrícula junto do perfil escolhido. A confirmação
 * definitiva do vínculo (aluno ou professor) é responsabilidade do backend.
 */
export async function cadastro({
    role,
    name,
    matricula,
    email,
    instituicao,
    senha,
}: CadastroInput): Promise<CadastroResult> {
    try {
        const response = await api.post('users', {
            role,
            name,
            matricula,
            email,
            instituicao,
            password: senha,
        });

        return { ok: true, perfil: parsePerfil(response.data?.role) };
    } catch (error) {
        console.error('Error during registration:', error);
        return {
            ok: false,
            message: extractApiError(
                error,
                'Não foi possível concluir o cadastro. Tente novamente.'
            ),
        };
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
  localStorage.setItem("user_role", role);
}

export function getUserRole(): PerfilAcademico | null {
  return parsePerfil(localStorage.getItem("user_role"));
}

export function deleteUserRole() {
  localStorage.removeItem("user_role");
}
