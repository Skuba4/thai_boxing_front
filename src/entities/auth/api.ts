import { env } from "../../config/env";
import { apiRequest } from "../../shared/api/request";
import type { LoginPayload, LoginResponse, RegisterPayload } from "./types";

export async function login(payload: LoginPayload) {
  const response = await apiRequest<LoginResponse>(env.authLoginPath, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    access: response.access ?? response.token ?? "",
    refresh: response.refresh,
  };
}

export async function register(payload: RegisterPayload) {
  return apiRequest<unknown>(env.authRegisterPath, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
