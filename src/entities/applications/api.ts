import { apiRequest } from "../../shared/api/request";
import type {
  CreateRoomApplicationPayload,
  JudgeApplication,
  RoomApplication,
  RoomApplicationStatus,
  UpdateJudgeApplicationPayload,
} from "./types";

export async function getRoomApplications(accessToken: string, roomUuid: string) {
  return apiRequest<RoomApplication[]>(`/referee/room/${roomUuid}/trainer-applications/`, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function createRoomApplication(
  accessToken: string,
  roomUuid: string,
  payload: CreateRoomApplicationPayload,
) {
  return apiRequest<{ detail?: string }>(
    `/referee/room/${roomUuid}/trainer-application/`,
    {
      method: "POST",
      authToken: accessToken,
      body: JSON.stringify(payload),
    },
  );
}

export async function getOwnRoomApplication(accessToken: string, roomUuid: string) {
  return apiRequest<RoomApplication>(`/referee/room/${roomUuid}/trainer-application/`, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function updateRoomApplication(
  accessToken: string,
  roomUuid: string,
  applicationUuid: string,
  status: RoomApplicationStatus,
) {
  return apiRequest<RoomApplication>(
    `/referee/room/${roomUuid}/trainer-application/${applicationUuid}/`,
    {
      method: "PATCH",
      authToken: accessToken,
      body: JSON.stringify({ status }),
    },
  );
}

export async function updateOwnRoomApplication(
  accessToken: string,
  roomUuid: string,
  payload: CreateRoomApplicationPayload,
) {
  return apiRequest<{ detail?: string }>(
    `/referee/room/${roomUuid}/trainer-application/`,
    {
      method: "PATCH",
      authToken: accessToken,
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteOwnRoomApplication(accessToken: string, roomUuid: string) {
  return apiRequest<null>(`/referee/room/${roomUuid}/trainer-application/`, {
    method: "DELETE",
    authToken: accessToken,
  });
}

export async function deleteRoomApplication(
  accessToken: string,
  roomUuid: string,
  applicationUuid: string,
) {
  return apiRequest<null>(`/referee/room/${roomUuid}/trainer-application/${applicationUuid}/`, {
    method: "DELETE",
    authToken: accessToken,
  });
}

export async function createJudgeApplication(accessToken: string, roomUuid: string) {
  return apiRequest<{ detail?: string }>(`/referee/room/${roomUuid}/judge-application/`, {
    method: "POST",
    authToken: accessToken,
  });
}

export async function getJudgeApplications(accessToken: string, roomUuid: string) {
  return apiRequest<JudgeApplication[]>(`/referee/room/${roomUuid}/judge-applications/`, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function getOwnJudgeApplication(accessToken: string, roomUuid: string) {
  return apiRequest<JudgeApplication>(`/referee/room/${roomUuid}/judge-application/`, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function updateJudgeApplication(
  accessToken: string,
  roomUuid: string,
  applicationUuid: string,
  payload: UpdateJudgeApplicationPayload,
) {
  return apiRequest<JudgeApplication>(
    `/referee/room/${roomUuid}/judge-application/${applicationUuid}/`,
    {
      method: "PATCH",
      authToken: accessToken,
      body: JSON.stringify(payload),
    },
  );
}

export async function getRingSideJudges(accessToken: string, roomUuid: string, ringName: string) {
  return apiRequest<JudgeApplication[]>(`/referee/room/${roomUuid}/ring/${ringName}/side-judges`, {
    method: "GET",
    authToken: accessToken,
  });
}

export async function updateRingSideJudgeActive(
  accessToken: string,
  roomUuid: string,
  ringName: string,
  applicationUuid: string,
  isActive: boolean,
) {
  return apiRequest<{ detail: string }>(
    `/referee/room/${roomUuid}/ring/${ringName}/judge-application/${applicationUuid}/patch-active`,
    {
      method: "PATCH",
      authToken: accessToken,
      body: JSON.stringify({ is_active: isActive }),
    },
  );
}

export async function deleteOwnJudgeApplication(accessToken: string, roomUuid: string) {
  return apiRequest<null>(`/referee/room/${roomUuid}/judge-application/`, {
    method: "DELETE",
    authToken: accessToken,
  });
}

export async function deleteJudgeApplication(
  accessToken: string,
  roomUuid: string,
  applicationUuid: string,
) {
  return apiRequest<null>(`/referee/room/${roomUuid}/judge-application/${applicationUuid}/`, {
    method: "DELETE",
    authToken: accessToken,
  });
}
