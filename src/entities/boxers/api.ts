import { env } from "../../config/env";
import { apiRequest } from "../../shared/api/request";
import type { Boxer, BoxerPayload, RoomBoxer, RoomBoxerPayload } from "./types";

export async function getBoxers(accessToken: string) {
  return apiRequest<Boxer[]>(env.boxersPath, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function createBoxer(accessToken: string, payload: BoxerPayload) {
  return apiRequest<Boxer>(env.boxersPath, {
    method: "POST",
    authToken: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function updateBoxer(
  accessToken: string,
  boxerUuid: string,
  payload: BoxerPayload,
) {
  return apiRequest<Boxer>(`${env.boxersPath}${boxerUuid}/`, {
    method: "PATCH",
    authToken: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function deleteBoxer(accessToken: string, boxerUuid: string) {
  return apiRequest<null>(`${env.boxersPath}${boxerUuid}/`, {
    method: "DELETE",
    authToken: accessToken,
  });
}

export async function getRoomBoxers(accessToken: string, roomUuid: string) {
  return apiRequest<RoomBoxer[]>(`/referee/room/${roomUuid}/boxers/`, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function bulkCreateRoomBoxers(
  accessToken: string,
  roomUuid: string,
  payload: { boxer_ids: string[] },
) {
  return apiRequest<RoomBoxer[]>(`/referee/room/${roomUuid}/boxers/`, {
    method: "POST",
    authToken: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function bulkDestroyRoomBoxers(accessToken: string, roomUuid: string) {
  return apiRequest<{ detail?: string }>(`/referee/room/${roomUuid}/boxers/`, {
    method: "DELETE",
    authToken: accessToken,
  });
}

export async function updateRoomBoxer(
  accessToken: string,
  roomUuid: string,
  boxerUuid: string,
  payload: RoomBoxerPayload,
) {
  return apiRequest<RoomBoxer>(`/referee/room/${roomUuid}/boxers/${boxerUuid}/`, {
    method: "PATCH",
    authToken: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function deleteRoomBoxer(
  accessToken: string,
  roomUuid: string,
  boxerUuid: string,
) {
  return apiRequest<null>(`/referee/room/${roomUuid}/boxers/${boxerUuid}/`, {
    method: "DELETE",
    authToken: accessToken,
  });
}
