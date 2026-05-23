import type { Dispatch, SetStateAction } from "react";
import { type Grid, updateRoomGrid } from "../../features/auth/authApi";
import { getAuthTokens } from "../../features/auth/authStorage";
import { getErrorMessage } from "../homeErrors";
import type { DraftGridSlot } from "./lib";
import type { DraggingGridBoxer, DropTarget } from "./types";

type State = "idle" | "loading" | "success" | "error";

export function useRoomGridDrafts({
  changedDraftGrids,
  draftGridBoxers,
  hasDraftMoves,
  loadPairsData,
  refreshParticipantsData,
  roomUuid,
  setDraftGridBoxers,
  setDraggingGridBoxer,
  setDropTarget,
  setGridState,
  setMessage,
}: {
  changedDraftGrids: Map<string, string[]>;
  draftGridBoxers: Record<string, DraftGridSlot[]>;
  hasDraftMoves: boolean;
  loadPairsData: (accessToken: string, roomUuid?: string) => Promise<Grid[]>;
  refreshParticipantsData: (accessToken: string, roomUuid?: string) => Promise<void>;
  roomUuid: string;
  setDraftGridBoxers: Dispatch<SetStateAction<Record<string, DraftGridSlot[]>>>;
  setDraggingGridBoxer: Dispatch<SetStateAction<DraggingGridBoxer>>;
  setDropTarget: Dispatch<SetStateAction<DropTarget>>;
  setGridState: Dispatch<SetStateAction<State>>;
  setMessage: Dispatch<SetStateAction<string>>;
}) {
  async function handleSaveDraftGrids() {
    const tokens = getAuthTokens();
    if (!tokens?.access) {
      setMessage("Сессия истекла.");
      return false;
    }
    if (!hasDraftMoves) {
      setMessage("Изменений нет.");
      return false;
    }

    try {
      setGridState("loading");
      for (const [gridId, boxerList] of changedDraftGrids.entries()) {
        await updateRoomGrid(tokens.access, roomUuid, gridId, { boxer_list: boxerList });
      }
      setDraftGridBoxers({});
      await loadPairsData(tokens.access, roomUuid);
      setDraggingGridBoxer(null);
      setDropTarget(null);
      setGridState("success");
      setMessage("Сетки сохранены.");
      return true;
    } catch (error) {
      setGridState("error");
      setMessage(getErrorMessage(error));
      return false;
    }
  }

  async function handleDeleteDraftGridBoxer(gridId: string, boxerUuid: string) {
    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");

    try {
      setGridState("loading");
      const currentGridBoxers = draftGridBoxers[gridId] ?? [];
      const nextBoxerList = currentGridBoxers.flatMap((gridBoxer) =>
        gridBoxer && gridBoxer.uuid !== boxerUuid ? [gridBoxer.uuid] : [],
      );
      await updateRoomGrid(tokens.access, roomUuid, gridId, { boxer_list: nextBoxerList });
      setDraftGridBoxers({});
      await loadPairsData(tokens.access, roomUuid);
      await refreshParticipantsData(tokens.access, roomUuid);
      setDraggingGridBoxer(null);
      setDropTarget(null);
      setGridState("success");
      setMessage("Участник удален из сетки.");
    } catch (error) {
      setGridState("error");
      setMessage(getErrorMessage(error));
    }
  }

  async function handleResetDraftGrids() {
    const tokens = getAuthTokens();
    if (!tokens?.access) {
      setMessage("Сессия истекла.");
      return false;
    }

    try {
      setGridState("loading");
      setDraftGridBoxers({});
      await loadPairsData(tokens.access, roomUuid);
      setDraggingGridBoxer(null);
      setDropTarget(null);
      setGridState("success");
      setMessage("Сетки сброшены.");
      return true;
    } catch (error) {
      setGridState("error");
      setMessage(getErrorMessage(error));
      return false;
    }
  }

  return {
    handleDeleteDraftGridBoxer,
    handleResetDraftGrids,
    handleSaveDraftGrids,
  };
}
