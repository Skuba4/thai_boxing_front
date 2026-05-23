import type { Dispatch, FormEvent, MutableRefObject, SetStateAction } from "react";
import {
  buildRoomGridStage,
  createRoomGrid,
  deleteRoomGrid,
  type CreateGridPayload,
  type Fight,
  type Grid,
  type Ring,
  updateRoomGrid,
} from "../../features/auth/authApi";
import { getAuthTokens } from "../../features/auth/authStorage";
import { capitalizeFirstLetter } from "../homeBoxers";
import { getErrorMessage } from "../homeErrors";
import { getRoomTabStorageKey } from "./constants";
import type { DraftGridSlot } from "./lib";
import type { DraggingGridBoxer, DropTarget, OwnerTab, PendingDraftAction, RingGridOrderDrafts } from "./types";
import { useRingGridOrder } from "./useRingGridOrder";
import { useRoomGridDrafts } from "./useRoomGridDrafts";

type State = "idle" | "loading" | "success" | "error";

export function useRoomGrids({
  activeRing,
  builtGridFights,
  changedDraftGrids,
  defaultRingGridOrders,
  draftGridBoxers,
  draftGridBoxersRef,
  draftRingGridOrders,
  editingGridId,
  gridForm,
  grids,
  gridsState,
  hasActiveRingDraftMoves,
  hasDraftMoves,
  loadGuestRoomBoxers,
  loadPairsData,
  loadRoomBoxers,
  loadRoomRings,
  onActiveRingNameChange,
  ownerTab,
  pendingDraftAction,
  refreshParticipantsData,
  rings,
  roomIsOwner,
  roomUuid,
  savedRingGridOrders,
  selectedBoxerIds,
  setActiveRing,
  setDraftGridBoxers,
  setDraftRingGridOrders,
  setDraggingGridBoxer,
  setDraggingRingGridId,
  setDropTarget,
  setEditingGridId,
  setGridForm,
  setGridState,
  setGridsState,
  setIsGridModalOpen,
  setMessage,
  setOwnerTab,
  setPendingDraftAction,
  setRingGridDropTargetId,
  setSavedRingGridOrders,
  setSelectedBoxerIds,
  sortedGrids,
}: {
  activeRing: Ring | null;
  builtGridFights: Record<string, Fight[]>;
  changedDraftGrids: Map<string, string[]>;
  defaultRingGridOrders: RingGridOrderDrafts;
  draftGridBoxers: Record<string, DraftGridSlot[]>;
  draftGridBoxersRef: MutableRefObject<Record<string, DraftGridSlot[]>>;
  draftRingGridOrders: RingGridOrderDrafts;
  editingGridId: string | null;
  gridForm: CreateGridPayload;
  grids: Grid[];
  gridsState: State;
  hasActiveRingDraftMoves: boolean;
  hasDraftMoves: boolean;
  loadGuestRoomBoxers: () => Promise<void>;
  loadPairsData: (accessToken: string, roomUuid?: string) => Promise<Grid[]>;
  loadRoomBoxers: (accessToken: string, roomUuid?: string) => Promise<void>;
  loadRoomRings: (accessToken: string, roomUuid?: string) => Promise<void>;
  onActiveRingNameChange: (ringName: string | null) => void;
  ownerTab: OwnerTab;
  pendingDraftAction: PendingDraftAction | null;
  refreshParticipantsData: (accessToken: string, roomUuid?: string) => Promise<void>;
  rings: Ring[];
  roomIsOwner: boolean;
  roomUuid: string;
  savedRingGridOrders: RingGridOrderDrafts;
  selectedBoxerIds: string[];
  setActiveRing: Dispatch<SetStateAction<Ring | null>>;
  setDraftGridBoxers: Dispatch<SetStateAction<Record<string, DraftGridSlot[]>>>;
  setDraftRingGridOrders: Dispatch<SetStateAction<RingGridOrderDrafts>>;
  setDraggingGridBoxer: Dispatch<SetStateAction<DraggingGridBoxer>>;
  setDraggingRingGridId: Dispatch<SetStateAction<string | null>>;
  setDropTarget: Dispatch<SetStateAction<DropTarget>>;
  setEditingGridId: Dispatch<SetStateAction<string | null>>;
  setGridForm: Dispatch<SetStateAction<CreateGridPayload>>;
  setGridState: Dispatch<SetStateAction<State>>;
  setGridsState: Dispatch<SetStateAction<State>>;
  setIsGridModalOpen: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setOwnerTab: Dispatch<SetStateAction<OwnerTab>>;
  setPendingDraftAction: Dispatch<SetStateAction<PendingDraftAction | null>>;
  setRingGridDropTargetId: Dispatch<SetStateAction<string | null>>;
  setSavedRingGridOrders: Dispatch<SetStateAction<RingGridOrderDrafts>>;
  setSelectedBoxerIds: Dispatch<SetStateAction<string[]>>;
  sortedGrids: Grid[];
}) {
  const {
    handleResetRingGridOrderDrafts,
    handleSaveRingGridOrderDrafts,
    moveRingGrid,
  } = useRingGridOrder({
    activeRing,
    builtGridFights,
    defaultRingGridOrders,
    draftRingGridOrders,
    grids,
    loadPairsData,
    roomUuid,
    savedRingGridOrders,
    setDraggingRingGridId,
    setDraftRingGridOrders,
    setGridState,
    setMessage,
    setRingGridDropTargetId,
    setSavedRingGridOrders,
  });
  const {
    handleDeleteDraftGridBoxer,
    handleResetDraftGrids,
    handleSaveDraftGrids,
  } = useRoomGridDrafts({
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
  });

  function handleGridFormChange<K extends keyof CreateGridPayload>(field: K, value: CreateGridPayload[K]) {
    setGridForm((current) => ({
      ...current,
      [field]: field === "name" && typeof value === "string" ? capitalizeFirstLetter(value) : value,
    }));
  }

  async function handleOpenGridModal() {
    if (selectedBoxerIds.length === 0) return;
    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");
    if (gridsState === "idle" || gridsState === "error") await loadPairsData(tokens.access, roomUuid);
    setEditingGridId(null);
    setGridForm({ name: "", boxer_list: selectedBoxerIds });
    setGridState("idle");
    setIsGridModalOpen(true);
  }

  async function handleCreateGrid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const tokens = getAuthTokens();
    if (!tokens?.access || selectedBoxerIds.length === 0) return setMessage("Выбери спортсменов.");

    try {
      setGridState("loading");
      const gridName = gridForm.name.trim();
      const existingGrid = sortedGrids.find(
        (grid) => grid.name.trim().toLocaleLowerCase("ru") === gridName.toLocaleLowerCase("ru"),
      );

      if (existingGrid) {
        const mergedBoxerList = Array.from(
          new Set([
            ...(existingGrid.boxer_list ?? []).filter((boxerUuid): boxerUuid is string => Boolean(boxerUuid)),
            ...selectedBoxerIds,
          ]),
        );
        await updateRoomGrid(tokens.access, roomUuid, existingGrid.uuid, { boxer_list: mergedBoxerList });
      } else {
        await createRoomGrid(tokens.access, roomUuid, { name: gridName, boxer_list: selectedBoxerIds });
      }

      draftGridBoxersRef.current = {};
      setDraftGridBoxers({});
      setDraggingGridBoxer(null);
      setDropTarget(null);
      await loadPairsData(tokens.access, roomUuid);
      await refreshParticipantsData(tokens.access, roomUuid);
      setSelectedBoxerIds([]);
      setIsGridModalOpen(false);
      setGridState("success");
      setMessage(existingGrid ? "Участники добавлены в сетку." : "Сетка создана.");
    } catch (error) {
      setGridState("error");
      setMessage(getErrorMessage(error));
    }
  }

  async function handleSaveGrid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const tokens = getAuthTokens();
    if (!tokens?.access || editingGridId === null) return setMessage("Сессия истекла.");

    try {
      setGridState("loading");
      await updateRoomGrid(tokens.access, roomUuid, editingGridId, {
        name: gridForm.name.trim(),
        boxer_list:
          grids
            .find((grid) => grid.uuid === editingGridId)
            ?.boxer_list?.filter((boxerUuid): boxerUuid is string => Boolean(boxerUuid)) ?? [],
      });
      setGridsState("idle");
      setIsGridModalOpen(false);
      setEditingGridId(null);
      setGridState("success");
      setMessage("Сетка обновлена.");
    } catch (error) {
      setGridState("error");
      setMessage(getErrorMessage(error));
    }
  }

  async function handleDeleteGrid(gridId: string) {
    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");

    try {
      setGridState("loading");
      await deleteRoomGrid(tokens.access, roomUuid, gridId);
      await loadPairsData(tokens.access, roomUuid);
      await refreshParticipantsData(tokens.access, roomUuid);
      setGridState("success");
      setMessage("Сетка удалена.");
    } catch (error) {
      setGridState("error");
      setMessage(getErrorMessage(error));
    }
  }

  async function handleBuildGrid(gridId: string, gridBoxers: DraftGridSlot[]) {
    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");

    try {
      setGridState("loading");
      const latestGridBoxers = draftGridBoxersRef.current[gridId] ?? gridBoxers;
      await buildRoomGridStage(tokens.access, roomUuid, gridId, {
        boxer_list: latestGridBoxers.map((gridBoxer) => gridBoxer?.uuid ?? null),
      });

      setDraftGridBoxers({});
      setDraggingGridBoxer(null);
      setDropTarget(null);
      await loadRoomBoxers(tokens.access, roomUuid);
      await loadRoomRings(tokens.access, roomUuid);
      await loadPairsData(tokens.access, roomUuid);
      setGridState("success");
      setMessage("Сетка построена.");
    } catch (error) {
      setGridState("error");
      setMessage(getErrorMessage(error) || "Не удалось отправить первый столбец.");
    }
  }

  async function handleAssignGridRing(gridId: string, ringName: string) {
    const tokens = getAuthTokens();
    if (!tokens?.access) return setMessage("Сессия истекла.");

    try {
      setGridState("loading");
      await updateRoomGrid(tokens.access, roomUuid, gridId, { ring: ringName || null });
      await loadPairsData(tokens.access, roomUuid);
      setGridState("success");
      setMessage(ringName ? "Сетка отправлена в ринг." : "Сетка снята с ринга.");
    } catch (error) {
      setGridState("error");
      setMessage(getErrorMessage(error));
    }
  }

  async function applyPendingDraftAction(action: PendingDraftAction) {
    setPendingDraftAction(null);

    if (action.type === "tab") {
      const tokens = getAuthTokens();
      sessionStorage.setItem(getRoomTabStorageKey(roomUuid), action.tab);
      setOwnerTab(action.tab);
      setActiveRing(null);
      setDraggingRingGridId(null);
      setRingGridDropTargetId(null);
      onActiveRingNameChange(null);

      if (action.tab === "participants" && tokens?.access) {
        if (roomIsOwner) void loadRoomBoxers(tokens.access, roomUuid);
        else void loadGuestRoomBoxers();
      }
      return;
    }

    if (action.type === "ring") {
      const localRing = rings.find((ring) => ring.name === action.ringName) ?? null;
      if (!localRing) return setMessage("Сначала открой вкладку рингов.");
      setActiveRing(localRing);
      setOwnerTab("ring-detail");
      setDraggingRingGridId(null);
      setRingGridDropTargetId(null);
      onActiveRingNameChange(action.ringName);
      return;
    }

    await handleDeleteGrid(action.gridId);
  }

  async function handleSaveAndContinuePendingDraftAction() {
    if (!pendingDraftAction) return;
    const isSaved =
      ownerTab === "ring-detail" && hasActiveRingDraftMoves
        ? await handleSaveRingGridOrderDrafts()
        : await handleSaveDraftGrids();
    if (isSaved) await applyPendingDraftAction(pendingDraftAction);
  }

  async function handleResetAndContinuePendingDraftAction() {
    if (!pendingDraftAction) return;
    const isReset =
      ownerTab === "ring-detail" && hasActiveRingDraftMoves
        ? await handleResetRingGridOrderDrafts()
        : await handleResetDraftGrids();
    if (isReset) await applyPendingDraftAction(pendingDraftAction);
  }

  return {
    handleAssignGridRing,
    handleBuildGrid,
    handleCreateGrid,
    handleDeleteDraftGridBoxer,
    handleDeleteGrid,
    handleGridFormChange,
    handleOpenGridModal,
    handleResetAndContinuePendingDraftAction,
    handleSaveAndContinuePendingDraftAction,
    handleSaveGrid,
    handleSaveRingGridOrderDrafts,
    moveRingGrid,
  };
}
