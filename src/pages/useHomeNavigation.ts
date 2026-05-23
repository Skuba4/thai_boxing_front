import { useCallback, useEffect, useState } from "react";
import type { Room } from "../features/auth/authApi";
import type { RoomPanelCache } from "./homePanelTypes";
import type { CabinetTab, RequestState } from "./homeSharedTypes";
import {
  ACTIVE_ROOM_RING_STORAGE_KEY,
  ACTIVE_ROOM_STORAGE_KEY,
  ACTIVE_TAB_STORAGE_KEY,
  PINNED_ROOMS_STORAGE_KEY,
} from "./homeStorage";

function areDraftMovesEqual(
  previousDrafts: RoomPanelCache["draftMovesByTargetGrid"],
  nextDrafts: RoomPanelCache["draftMovesByTargetGrid"],
) {
  const previousKeys = Object.keys(previousDrafts);
  const nextKeys = Object.keys(nextDrafts);

  if (previousKeys.length !== nextKeys.length) {
    return false;
  }

  for (const gridId of previousKeys) {
    const previousBoxers = previousDrafts[gridId];
    const nextBoxers = nextDrafts[gridId];

    if (!nextBoxers || previousBoxers.length !== nextBoxers.length) {
      return false;
    }

    for (let index = 0; index < previousBoxers.length; index += 1) {
      if (previousBoxers[index] !== nextBoxers[index]) {
        return false;
      }
    }
  }

  return true;
}

export type PendingCabinetNavigation =
  | { type: "tab"; tab: CabinetTab }
  | { type: "room"; roomUuid: string }
  | null;

export function useHomeNavigation({
  activeTabDefault,
  activeRoomRingName,
  activeRooms,
  hasUnsavedRoomDraftMoves,
}: {
  activeTabDefault: CabinetTab;
  activeRoomRingName: string | null;
  activeRooms: Room[];
  hasUnsavedRoomDraftMoves: boolean;
}) {
  const [pendingCabinetNavigation, setPendingCabinetNavigation] = useState<PendingCabinetNavigation>(null);
  const [cabinetNavigationState, setCabinetNavigationState] = useState<RequestState>("idle");
  const [activeTab, setActiveTab] = useState<CabinetTab>(() => {
    const savedTab = sessionStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    return savedTab === "competitions" || savedTab === "competition-room" || savedTab === "athletes" || savedTab === "profile"
      ? savedTab
      : activeTabDefault;
  });
  const [activeRoomUuid, setActiveRoomUuid] = useState<string | null>(() =>
    sessionStorage.getItem(ACTIVE_ROOM_STORAGE_KEY),
  );
  const [openRoomUuids, setOpenRoomUuids] = useState<string[]>(() => {
    try {
      const savedValue = sessionStorage.getItem(PINNED_ROOMS_STORAGE_KEY);
      const parsedValue = savedValue ? (JSON.parse(savedValue) as unknown) : [];
      if (!Array.isArray(parsedValue)) return [];
      return parsedValue.filter((item): item is string => typeof item === "string").slice(0, 3);
    } catch {
      return [];
    }
  });

  const selectedRoom = activeRooms.find((room) => room.uuid === activeRoomUuid) ?? null;

  useEffect(() => {
    if (!hasUnsavedRoomDraftMoves) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedRoomDraftMoves]);

  useEffect(() => {
    sessionStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (activeRoomUuid) {
      sessionStorage.setItem(ACTIVE_ROOM_STORAGE_KEY, activeRoomUuid);
      return;
    }
    sessionStorage.removeItem(ACTIVE_ROOM_STORAGE_KEY);
  }, [activeRoomUuid]);

  useEffect(() => {
    if (activeRoomRingName) {
      sessionStorage.setItem(ACTIVE_ROOM_RING_STORAGE_KEY, activeRoomRingName);
      return;
    }
    sessionStorage.removeItem(ACTIVE_ROOM_RING_STORAGE_KEY);
  }, [activeRoomRingName]);

  useEffect(() => {
    sessionStorage.setItem(PINNED_ROOMS_STORAGE_KEY, JSON.stringify(openRoomUuids));
  }, [openRoomUuids]);

  const handleRoomCacheChange = useCallback((roomUuid: string, nextState: RoomPanelCache, setRoomPanelCache: React.Dispatch<React.SetStateAction<Record<string, RoomPanelCache>>>) => {
    setRoomPanelCache((current) => {
      const previousState = current[roomUuid];
      if (
        previousState &&
        previousState.boxers === nextState.boxers &&
        previousState.boxersState === nextState.boxersState &&
        previousState.rings === nextState.rings &&
        previousState.ringsState === nextState.ringsState &&
        previousState.grids === nextState.grids &&
        previousState.gridsState === nextState.gridsState &&
        previousState.activeRing?.name === nextState.activeRing?.name &&
        previousState.hasUnsavedDraftMoves === nextState.hasUnsavedDraftMoves &&
        areDraftMovesEqual(previousState.draftMovesByTargetGrid, nextState.draftMovesByTargetGrid)
      ) {
        return current;
      }
      return { ...current, [roomUuid]: nextState };
    });
  }, []);

  function handleCabinetTabChange(nextTab: CabinetTab) {
    if (activeTab === "competition-room" && hasUnsavedRoomDraftMoves) {
      setPendingCabinetNavigation({ type: "tab", tab: nextTab });
      return;
    }
    setActiveTab(nextTab);
  }

  function handleOpenRoomTab(roomUuid: string, setActiveRoomRingName: (value: string | null) => void) {
    if (activeTab === "competition-room" && hasUnsavedRoomDraftMoves) {
      setPendingCabinetNavigation({ type: "room", roomUuid });
      return;
    }
    if (activeRoomUuid === roomUuid && activeRoomRingName) {
      setActiveRoomRingName(null);
      setActiveTab("competition-room");
      return;
    }
    setActiveRoomUuid(roomUuid);
    setActiveRoomRingName(null);
    setActiveTab("competition-room");
  }

  function applyPendingCabinetNavigation(action: NonNullable<PendingCabinetNavigation>, setActiveRoomRingName: (value: string | null) => void) {
    setPendingCabinetNavigation(null);
    if (action.type === "tab") {
      setActiveRoomRingName(null);
      setActiveTab(action.tab);
      return;
    }
    if (activeRoomUuid === action.roomUuid && activeRoomRingName) {
      setActiveRoomRingName(null);
      setActiveTab("competition-room");
      return;
    }
    setActiveRoomUuid(action.roomUuid);
    setActiveRoomRingName(null);
    setActiveTab("competition-room");
  }

  function togglePinnedRoom(roomUuid: string) {
    let changed = false;
    let pinned = false;
    let limitExceeded = false;

    setOpenRoomUuids((current) => {
      if (current.includes(roomUuid)) {
        changed = true;
        return current.filter((uuid) => uuid !== roomUuid);
      }

      if (current.length >= 3) {
        limitExceeded = true;
        return current;
      }

      changed = true;
      pinned = true;
      return [roomUuid, ...current];
    });

    return { changed, pinned, limitExceeded };
  }

  return {
    activeRoomUuid,
    activeTab,
    applyPendingCabinetNavigation,
    cabinetNavigationState,
    handleCabinetTabChange,
    handleOpenRoomTab,
    handleRoomCacheChange,
    openRoomUuids,
    pendingCabinetNavigation,
    selectedRoom,
    setActiveRoomUuid,
    setActiveTab,
    setCabinetNavigationState,
    setOpenRoomUuids,
    setPendingCabinetNavigation,
    togglePinnedRoom,
  };
}
