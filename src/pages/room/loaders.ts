import {
  getJudgeApplications,
  getRoomApplications,
  getRoomBoxers,
  getRoomFights,
  getRoomGrids,
  getRoomRings,
} from "../../features/auth/authApi";
import { gridFightsByGrid } from "./lib";

export async function loadBoxers(accessToken: string, roomUuid: string) {
  return getRoomBoxers(accessToken, roomUuid);
}

export async function loadRings(accessToken: string, roomUuid: string) {
  return getRoomRings(accessToken, roomUuid);
}

export async function loadPairs(accessToken: string, roomUuid: string) {
  const [grids, fights] = await Promise.all([
    getRoomGrids(accessToken, roomUuid),
    getRoomFights(accessToken, roomUuid),
  ]);

  return {
    fightsByGrid: gridFightsByGrid(fights),
    grids,
  };
}

export async function loadApplications(accessToken: string, roomUuid: string) {
  return getRoomApplications(accessToken, roomUuid);
}

export async function loadJudgeApplications(accessToken: string, roomUuid: string) {
  return getJudgeApplications(accessToken, roomUuid);
}
