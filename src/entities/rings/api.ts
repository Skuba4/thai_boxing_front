import { apiRequest } from "../../shared/api/request";
import type { Ring, UpdateRingPayload } from "./types";

export async function getRoomRings(accessToken: string, roomUuid: string) {
  return apiRequest<Ring[]>(`/referee/room/${roomUuid}/rings/`, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function getRoomRing(
  accessToken: string,
  roomUuid: string,
  ringName: string,
) {
  return apiRequest<Ring>(`/referee/room/${roomUuid}/ring/${ringName}/`, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function updateRoomRing(
  accessToken: string,
  roomUuid: string,
  ringName: string,
  payload: UpdateRingPayload,
) {
  return apiRequest<Ring>(`/referee/room/${roomUuid}/ring/${ringName}/`, {
    method: "PATCH",
    authToken: accessToken,
    body: JSON.stringify(payload),
  });
}
