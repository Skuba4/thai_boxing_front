import { apiRequest } from "../../shared/api/request";
import type {
  CreateFightPayload,
  CreateNotePayload,
  Fight,
  Note,
  UpdateFightRingOrderPayload,
  UpdateFightStatusPayload,
  UpdateFightWinnerPayload,
} from "./types";

export async function getRoomFights(accessToken: string, roomUuid: string) {
  return apiRequest<Fight[]>(`/referee/room/${roomUuid}/fights/`, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function createRoomFight(
  accessToken: string,
  roomUuid: string,
  payload: CreateFightPayload,
) {
  return apiRequest<Fight>(`/referee/room/${roomUuid}/fights/`, {
    method: "POST",
    authToken: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function deleteRoomFight(accessToken: string, roomUuid: string, fightId: number) {
  return apiRequest<null>(`/referee/room/${roomUuid}/fight/${fightId}/`, {
    method: "DELETE",
    authToken: accessToken,
  });
}

export async function updateRoomFight(
  accessToken: string,
  roomUuid: string,
  fightId: number,
  payload: CreateFightPayload & { winner: string | null },
) {
  return apiRequest<Fight>(`/referee/room/${roomUuid}/fight/${fightId}/`, {
    method: "PATCH",
    authToken: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function updateRoomFightWinner(
  accessToken: string,
  roomUuid: string,
  fightUuid: string,
  payload: UpdateFightWinnerPayload,
) {
  return apiRequest<{ detail: string }>(`/referee/room/${roomUuid}/fight/${fightUuid}/patch-winner/`, {
    method: "PATCH",
    authToken: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function updateRoomFightStatus(
  accessToken: string,
  roomUuid: string,
  fightUuid: string,
  payload: UpdateFightStatusPayload,
) {
  return apiRequest<{ detail: string }>(`/referee/room/${roomUuid}/fight/${fightUuid}/patch-status/`, {
    method: "PATCH",
    authToken: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function updateRoomFightsRingOrder(
  accessToken: string,
  roomUuid: string,
  payload: UpdateFightRingOrderPayload,
) {
  const fights = payload.fights ?? payload.data ?? {};
  const body = { fights };

  return apiRequest<{ detail: string }>(`/referee/room/${roomUuid}/fights/ring-order/`, {
    method: "POST",
    authToken: accessToken,
    body: JSON.stringify(body),
  });
}

export async function getRoomFightNotes(
  accessToken: string,
  roomUuid: string,
  fightUuid: string,
) {
  return apiRequest<Note[]>(`/referee/room/${roomUuid}/fight/${fightUuid}/notes/`, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function getMyRoomFightNotes(
  accessToken: string,
  roomUuid: string,
  fightUuid: string,
) {
  return apiRequest<Note[]>(`/referee/room/${roomUuid}/fight/${fightUuid}/my-notes/`, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function createRoomFightNote(
  accessToken: string,
  roomUuid: string,
  fightUuid: string,
  payload: CreateNotePayload,
) {
  return apiRequest<Note>(`/referee/room/${roomUuid}/fight/${fightUuid}/notes/`, {
    method: "POST",
    authToken: accessToken,
    body: JSON.stringify(payload),
  });
}
