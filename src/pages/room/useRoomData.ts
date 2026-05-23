import { useCallback, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Fight, Grid, JudgeApplication, Ring, RoomApplication, RoomBoxer } from "../../features/auth/authApi";
import { getAuthTokens } from "../../features/auth/authStorage";
import { getErrorMessage } from "../homeErrors";
import {
  loadApplications as loadApplicationsData,
  loadBoxers,
  loadJudgeApplications as loadJudgeApplicationsData,
  loadPairs,
  loadRings,
} from "./loaders";
import type { OwnerTab } from "./types";
import type { DraftGridSlot } from "./lib";

type State = "idle" | "loading" | "success" | "error";

type Props = {
  applicationsState: State;
  boxersState: State;
  canViewPairs: boolean;
  canViewRings: boolean;
  gridsState: State;
  isApprovedTrainer: boolean;
  isJudge: boolean;
  judgeApplicationsState: State;
  ownerTab: OwnerTab;
  ringsState: State;
  roomIsOwner: boolean;
  roomStatus: string;
  roomUuid: string;
  setApplications: Dispatch<SetStateAction<RoomApplication[]>>;
  setApplicationsState: Dispatch<SetStateAction<State>>;
  setBoxers: Dispatch<SetStateAction<RoomBoxer[]>>;
  setBoxersState: Dispatch<SetStateAction<State>>;
  setBuiltGridFights: Dispatch<SetStateAction<Record<string, Fight[]>>>;
  setDraftGridBoxers: Dispatch<SetStateAction<Record<string, DraftGridSlot[]>>>;
  setGrids: Dispatch<SetStateAction<Grid[]>>;
  setGridsState: Dispatch<SetStateAction<State>>;
  setJudgeApplications: Dispatch<SetStateAction<JudgeApplication[]>>;
  setJudgeApplicationsState: Dispatch<SetStateAction<State>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setRings: Dispatch<SetStateAction<Ring[]>>;
  setRingsState: Dispatch<SetStateAction<State>>;
};

export function useRoomData({
  applicationsState,
  boxersState,
  canViewPairs,
  canViewRings,
  gridsState,
  isApprovedTrainer,
  isJudge,
  judgeApplicationsState,
  ownerTab,
  ringsState,
  roomIsOwner,
  roomStatus,
  roomUuid,
  setApplications,
  setApplicationsState,
  setBoxers,
  setBoxersState,
  setBuiltGridFights,
  setDraftGridBoxers,
  setGrids,
  setGridsState,
  setJudgeApplications,
  setJudgeApplicationsState,
  setMessage,
  setRings,
  setRingsState,
}: Props) {
  const previousOwnerTabRef = useRef(ownerTab);
  const previousApplicationsTabRef = useRef(ownerTab);

  const loadGuestRoomBoxers = useCallback(async () => {
    const tokens = getAuthTokens();

    if (!tokens?.access) {
      setBoxers([]);
      setBoxersState("error");
      setMessage("Сессия истекла.");
      return;
    }

    try {
      setBoxersState("loading");
      setBoxers(await loadBoxers(tokens.access, roomUuid));
      setBoxersState("success");
      setMessage("");
    } catch {
      setBoxers([]);
      setBoxersState("error");
      setMessage("");
    }
  }, [roomUuid, setBoxers, setBoxersState, setMessage]);

  const loadRoomBoxers = useCallback(
    async (accessToken: string, targetRoomUuid = roomUuid) => {
      try {
        setBoxersState("loading");
        setBoxers(await loadBoxers(accessToken, targetRoomUuid));
        setBoxersState("success");
      } catch (error) {
        setBoxersState("error");
        setMessage(getErrorMessage(error));
      }
    },
    [roomUuid, setBoxers, setBoxersState, setMessage],
  );

  const loadRoomRings = useCallback(
    async (accessToken: string, targetRoomUuid = roomUuid) => {
      try {
        setRingsState("loading");
        setRings(await loadRings(accessToken, targetRoomUuid));
        setRingsState("success");
      } catch (error) {
        setRingsState("error");
        setMessage(getErrorMessage(error));
      }
    },
    [roomUuid, setMessage, setRings, setRingsState],
  );

  const loadPairsData = useCallback(
    async (accessToken: string, targetRoomUuid = roomUuid) => {
      try {
        setGridsState("loading");
        const { grids, fightsByGrid } = await loadPairs(accessToken, targetRoomUuid);
        setGrids(grids);
        setBuiltGridFights(fightsByGrid);
        setGridsState("success");
        return grids;
      } catch (error) {
        setGrids([]);
        setBuiltGridFights({});
        setGridsState("error");
        setMessage(getErrorMessage(error));
        return [];
      }
    },
    [roomUuid, setBuiltGridFights, setGrids, setGridsState, setMessage],
  );

  const loadApplications = useCallback(async () => {
    const tokens = getAuthTokens();

    if (!tokens?.access) {
      setMessage("Сессия истекла.");
      return;
    }

    try {
      setApplicationsState("loading");
      setApplications(await loadApplicationsData(tokens.access, roomUuid));
      setApplicationsState("success");
    } catch (error) {
      setApplicationsState("error");
      setMessage(getErrorMessage(error));
    }
  }, [roomUuid, setApplications, setApplicationsState, setMessage]);

  const loadJudgeApplications = useCallback(async () => {
    const tokens = getAuthTokens();

    if (!tokens?.access) {
      setMessage("Сессия истекла.");
      return;
    }

    try {
      setJudgeApplicationsState("loading");
      setJudgeApplications(await loadJudgeApplicationsData(tokens.access, roomUuid));
      setJudgeApplicationsState("success");
    } catch (error) {
      setJudgeApplicationsState("error");
      setMessage(getErrorMessage(error));
    }
  }, [roomUuid, setJudgeApplications, setJudgeApplicationsState, setMessage]);

  useEffect(() => {
    if (boxersState !== "idle") {
      return;
    }

    const shouldLoadVisibleBoxers =
      roomIsOwner ||
      isApprovedTrainer ||
      isJudge ||
      (!roomIsOwner && (roomStatus === "Y" || roomStatus === "N") && (ownerTab === "rings" || ownerTab === "ring-detail"));

    if (!shouldLoadVisibleBoxers) {
      return;
    }

    const tokens = getAuthTokens();

    if (!tokens?.access) {
      setBoxersState("error");
      setMessage("Сессия истекла.");
      return;
    }

    if (roomIsOwner) {
      void loadRoomBoxers(tokens.access);
      return;
    }

    void loadGuestRoomBoxers();
  }, [
    boxersState,
    isApprovedTrainer,
    isJudge,
    loadGuestRoomBoxers,
    loadRoomBoxers,
    ownerTab,
    roomIsOwner,
    roomStatus,
    setBoxersState,
    setMessage,
  ]);

  useEffect(() => {
    const previousTab = previousApplicationsTabRef.current;
    previousApplicationsTabRef.current = ownerTab;

    if (!roomIsOwner || ownerTab !== "applications") {
      return;
    }

    if (previousTab === "applications" && applicationsState !== "idle" && judgeApplicationsState !== "idle") {
      return;
    }

    void loadApplications();
    void loadJudgeApplications();
  }, [applicationsState, judgeApplicationsState, loadApplications, loadJudgeApplications, ownerTab, roomIsOwner]);

  useEffect(() => {
    if (!canViewRings || ringsState !== "idle") {
      return;
    }

    const tokens = getAuthTokens();

    if (!tokens?.access) {
      setRingsState("error");
      setMessage("Сессия истекла.");
      return;
    }

    void loadRoomRings(tokens.access);
  }, [canViewRings, loadRoomRings, ringsState, setMessage, setRingsState]);

  useEffect(() => {
    const previousOwnerTab = previousOwnerTabRef.current;
    previousOwnerTabRef.current = ownerTab;
    const shouldLoadGridData = (ownerTab === "pairs" && canViewPairs) || ownerTab === "ring-detail";

    if (!shouldLoadGridData) {
      return;
    }

    if (previousOwnerTab === ownerTab && gridsState !== "idle") {
      return;
    }

    const tokens = getAuthTokens();

    if (!tokens?.access) {
      setGridsState("error");
      setMessage("Сессия истекла.");
      return;
    }

    setDraftGridBoxers({});
    void loadPairsData(tokens.access);
  }, [canViewPairs, gridsState, loadPairsData, ownerTab, setDraftGridBoxers, setGridsState, setMessage]);

  return {
    fetchRoomBoxers: (accessToken: string, targetRoomUuid = roomUuid) => loadBoxers(accessToken, targetRoomUuid),
    loadApplications,
    loadGuestRoomBoxers,
    loadJudgeApplications,
    loadPairsData,
    loadRoomBoxers,
    loadRoomRings,
    refreshParticipantsData: loadRoomBoxers,
  };
}
