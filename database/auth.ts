const platformAuth =
  typeof window !== "undefined" ? require("./auth.web") : require("./auth.native");

export const {
  saveAccessToken,
  saveRefreshToken,
  saveUserId,
  deleteAccessToken,
  deleteRefreshToken,
  deleteUserId,
  getAccessToken,
  getRefreshToken,
  getUserId,
  saveUserRole,
  getUserRole,
  deleteUserRole,
  cadastro,
  login,
  logout,
} = platformAuth;

export type {
  CadastroInput,
  CadastroResult,
  LoginInput,
  LoginResult,
} from "./auth.native";
