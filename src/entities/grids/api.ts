import { apiRequest } from "../../shared/api/request";
import type {
  BuildGridStagePayload,
  CreateGridPayload,
  Grid,
  UpdateGridPayload,
} from "./types";

export async function createRoomGrid(
  accessToken: string,
  roomUuid: string,
  payload: CreateGridPayload,
) {
  return apiRequest<Grid>(`/referee/room/${roomUuid}/grids/`, {
    method: "POST",
    authToken: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function getRoomGrids(accessToken: string, roomUuid: string) {
  return apiRequest<Grid[]>(`/referee/room/${roomUuid}/grids/`, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function updateRoomGrid(
  accessToken: string,
  roomUuid: string,
  gridId: string,
  payload: UpdateGridPayload,
) {
  return apiRequest<Grid>(`/referee/room/${roomUuid}/grid/${gridId}/`, {
    method: "PATCH",
    authToken: accessToken,
    body: JSON.stringify(payload),
  });
}

export async function deleteRoomGrid(
  accessToken: string,
  roomUuid: string,
  gridId: string,
) {
  return apiRequest<null>(`/referee/room/${roomUuid}/grid/${gridId}/`, {
    method: "DELETE",
    authToken: accessToken,
  });
}

export async function buildRoomGridStage(
  accessToken: string,
  roomUuid: string,
  gridId: string,
  payload: BuildGridStagePayload,
) {
  return apiRequest<{ detail: string }>(`/referee/room/${roomUuid}/grid/${gridId}/`, {
    method: "POST",
    authToken: accessToken,
    body: JSON.stringify(payload),
  });
}
