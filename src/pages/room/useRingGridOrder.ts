import type { Dispatch, SetStateAction } from "react";
import {
  type Fight,
  type Grid,
  type Ring,
  updateRoomFightsRingOrder,
} from "../../features/auth/authApi";
import { getAuthTokens } from "../../features/auth/authStorage";
import { getErrorMessage } from "../homeErrors";
import { getRingFightOrderPayload } from "./drafts";
import type { RingGridOrderDrafts } from "./types";

type State = "idle" | "loading" | "success" | "error";

export function useRingGridOrder({
  activeRing,
  builtGridFights,
  defaultRingGridOrders,
  draftRingGridOrders,
  grids,
  roomUuid,
  savedRingGridOrders,
  setDraggingRingGridId,
  setDraftRingGridOrders,
  setGridState,
  setMessage,
  setRingGridDropTargetId,
  setSavedRingGridOrders,
  loadPairsData,
}: {
  activeRing: Ring | null;
  builtGridFights: Record<string, Fight[]>;
  defaultRingGridOrders: RingGridOrderDrafts;
  draftRingGridOrders: RingGridOrderDrafts;
  grids: Grid[];
  roomUuid: string;
  savedRingGridOrders: RingGridOrderDrafts;
  setDraggingRingGridId: Dispatch<SetStateAction<string | null>>;
  setDraftRingGridOrders: Dispatch<SetStateAction<RingGridOrderDrafts>>;
  setGridState: Dispatch<SetStateAction<State>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setRingGridDropTargetId: Dispatch<SetStateAction<string | null>>;
  setSavedRingGridOrders: Dispatch<SetStateAction<RingGridOrderDrafts>>;
  loadPairsData: (accessToken: string, roomUuid?: string) => Promise<Grid[]>;
}) {
  async function handleSaveRingGridOrderDrafts() {
    if (!activeRing) {
      setMessage("Сначала открой ринг.");
      return false;
    }
    const tokens = getAuthTokens();
    if (!tokens?.access) {
      setMessage("Сессия истекла.");
      return false;
    }

    const currentOrder = draftRingGridOrders[activeRing.name] ?? defaultRingGridOrders[activeRing.name] ?? [];
    const fights = getRingFightOrderPayload({ activeRingName: activeRing.name, builtGridFights, currentOrder, grids });
    if (!Object.keys(fights).length) {
      setMessage("В ринге нет боев для сохранения.");
      return false;
    }

    try {
      setGridState("loading");
      await updateRoomFightsRingOrder(tokens.access, roomUuid, { fights });
      setSavedRingGridOrders((current) => ({ ...current, [activeRing.name]: currentOrder }));
      await loadPairsData(tokens.access, roomUuid);
      setGridState("success");
      setMessage("Порядок боев сохранен.");
      return true;
    } catch (error) {
      setGridState("error");
      setMessage(getErrorMessage(error));
      return false;
    }
  }

  async function handleResetRingGridOrderDrafts() {
    if (!activeRing) {
      setMessage("Сначала открой ринг.");
      return false;
    }
    const savedOrder = savedRingGridOrders[activeRing.name] ?? defaultRingGridOrders[activeRing.name] ?? [];
    setDraftRingGridOrders((current) => ({ ...current, [activeRing.name]: savedOrder }));
    setDraggingRingGridId(null);
    setRingGridDropTargetId(null);
    setMessage("Порядок сеток в ринге сброшен.");
    return true;
  }

  function moveRingGrid(sourceGridId: string, targetGridId: string) {
    if (!activeRing) return;
    const currentOrder = draftRingGridOrders[activeRing.name] ?? defaultRingGridOrders[activeRing.name] ?? [];
    const sourceIndex = currentOrder.indexOf(sourceGridId);
    const targetIndex = currentOrder.indexOf(targetGridId);
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
    const nextOrder = [...currentOrder];
    const [movedGridId] = nextOrder.splice(sourceIndex, 1);
    nextOrder.splice(targetIndex, 0, movedGridId);
    setDraftRingGridOrders((current) => ({ ...current, [activeRing.name]: nextOrder }));
  }

  return {
    handleResetRingGridOrderDrafts,
    handleSaveRingGridOrderDrafts,
    moveRingGrid,
  };
}
