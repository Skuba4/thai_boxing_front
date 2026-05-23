import { env } from "../../config/env";
import { apiRequest } from "../../shared/api/request";
import type {
  PremiumApplicationResponse,
  UpdateProfilePayload,
  UserProfile,
} from "./types";

export async function getProfile(accessToken: string) {
  return apiRequest<UserProfile>(env.authProfilePath, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function updateProfile(
  accessToken: string,
  payload: UpdateProfilePayload,
) {
  return apiRequest<UserProfile>(env.authProfilePath, {
    method: "PATCH",
    authToken: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function activatePremium(accessToken: string) {
  return apiRequest<PremiumApplicationResponse>(env.authPremiumPath, {
    method: "POST",
    authToken: accessToken,
  });
}
