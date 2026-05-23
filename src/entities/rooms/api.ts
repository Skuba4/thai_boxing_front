import { env } from "../../config/env";
import { apiRequest } from "../../shared/api/request";
import type { CreateRoomPayload, Room } from "./types";

export async function getAllRooms(accessToken?: string) {
  return apiRequest<Room[]>(env.roomsAllPath, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function getRooms(accessToken: string) {
  return apiRequest<Room[]>(env.roomsPath, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function createRoom(accessToken: string, payload: CreateRoomPayload) {
  return apiRequest<Room>(env.roomsPath, {
    method: "POST",
    authToken: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function deleteRoom(accessToken: string, roomUuid: string) {
  return apiRequest<null>(`${env.roomsPath}${roomUuid}/`, {
    method: "DELETE",
    authToken: accessToken,
  });
}

export async function updateRoom(
  accessToken: string,
  roomUuid: string,
  payload: CreateRoomPayload,
) {
  return apiRequest<Room>(`${env.roomsPath}${roomUuid}/`, {
    method: "PATCH",
    authToken: accessToken,
    body: JSON.stringify(payload),
  });
}
